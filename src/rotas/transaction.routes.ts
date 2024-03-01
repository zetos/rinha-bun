import { routes } from "@stricjs/app";
import { json, status } from "@stricjs/app/send";
import { jsonv } from "@stricjs/app/parser";
import { t, vld } from "vld-ts";

import { transactionUpdateBalance } from "../db";

const Post = t.obj({
  valor: t.int,
  tipo: t.vals("c", "d"),
  descricao: t.str({ minLength: 1, maxLength: 10 }),
});

// Define and export your routes
export default routes("clientes")
  .state({ post: jsonv(vld(Post)) })
  .reject(() => status("Bad Request.", 400))
  .post("/:id/transacoes", async (ctx) => {
    const id = Number(ctx.params.id);
    if (id < 0) {
      // cheat and add a clientId > 5 check?
      return status(null, 404);
    }
    const bodyData = ctx.state.post;

    const result = await transactionUpdateBalance(
      id,
      bodyData.tipo,
      bodyData.valor,
      bodyData.descricao
    );

    if (result.updated) {
      return json({
        limite: result.lim,
        saldo: result.bal,
      });
    } else {
      return status(null, 422);
    }
  });
