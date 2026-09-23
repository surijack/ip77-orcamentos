import { COOKIE_NAME } from "@shared/const";
import { invokeLLM } from "./_core/llm";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { storageGetSignedUrl, storagePut } from "./storage";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  quote: router({
    analyze: publicProcedure
      .input(z.object({
        fileName: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(120),
        fileBase64: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const isPdf = input.mimeType === "application/pdf" || input.fileName.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
          throw new Error("Formato não suportado. Envie somente um orçamento em PDF.");
        }
        const cleanBase64 = input.fileBase64.replace(/^data:[^;]+;base64,/, "");
        const fileBuffer = Buffer.from(cleanBase64, "base64");
        if (fileBuffer.length === 0 || fileBuffer.length > 20 * 1024 * 1024) {
          throw new Error("O arquivo precisa ter entre 1 byte e 20 MB.");
        }

        const owner = ctx.user?.id ?? "anonymous";
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
        const stored = await storagePut(`quotes/${owner}/${Date.now()}-${safeName}`, fileBuffer, input.mimeType);
        const signedUrl = await storageGetSignedUrl(stored.key);

        const attachment = {
          type: "file_url" as const,
          file_url: {
            url: signedUrl,
            mime_type: "application/pdf" as const,
          },
        };

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um extrator rigoroso de dados de orçamentos comerciais brasileiros. Leia o arquivo anexado inteiro, inclusive todas as páginas. Extraia somente o que estiver escrito no documento, sem inventar ou completar dados. Preserve nomes técnicos, códigos, unidades e quantidades. Identifique o valor total final do orçamento. Se um campo não existir, retorne string vazia. Para os nomes dos produtos, remova apenas as menções às marcas BELENERGY e BELENUS, mantendo fabricante/modelo quando aparecerem.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extraia os dados do orçamento anexado e retorne o JSON solicitado. Considere todas as páginas e não use dados de exemplo.",
                },
                attachment,
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "quote_extraction",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  quoteNumber: { type: "string" },
                  issueDate: { type: "string" },
                  sellerName: { type: "string" },
                  sellerEmail: { type: "string" },
                  sellerPhone: { type: "string" },
                  supplier: { type: "string" },
                  customer: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      document: { type: "string" },
                      address: { type: "string" },
                      cityState: { type: "string" },
                      phone: { type: "string" },
                    },
                    required: ["name", "document", "address", "cityState", "phone"],
                    additionalProperties: false,
                  },
                  total: { type: "string" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        code: { type: "string" },
                        quantity: { type: "string" },
                      },
                      required: ["name", "code", "quantity"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["quoteNumber", "issueDate", "sellerName", "sellerEmail", "sellerPhone", "supplier", "customer", "total", "items"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices?.[0]?.message?.content;
        if (typeof content !== "string") throw new Error("A IA não retornou dados estruturados.");
        const parsed = JSON.parse(content) as {
          quoteNumber: string;
          issueDate: string;
          sellerName: string;
          sellerEmail: string;
          sellerPhone: string;
          supplier: string;
          customer: { name: string; document: string; address: string; cityState: string; phone: string };
          total: string;
          items: Array<{ name: string; code: string; quantity: string }>;
        };
        return {
          ...parsed,
          items: parsed.items.map((item, index) => ({ ...item, id: index + 1 })),
          sourceFile: stored.url,
        };
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
