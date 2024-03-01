import { routes } from "@stricjs/app";
import { text, json, status } from "@stricjs/app/send";

import { getBalance } from "../db";

// Define and export your routes
export default routes('clientes')
  .get("/", () => text("Welcome to Stric!"))
  .get("/:id/extrato", async (ctx) => {
    const id = Number(ctx.params.id);
    if (id < 0) {
      // cheat and add a clientId > 5 check?
      return status(null, 404);
    }
    console.log('current path:', ctx.path)
    console.log('current DB_HOSTNAME:', Bun.env.DB_HOSTNAME)

    const balance = await getBalance(id);

    if (!balance) {
      return status(null, 404);
    }

    return json({
      saldo: {
        total: balance.bal,
        data_extrato: balance.current_time,
        limite: balance.lim,
      },
      ultimas_transacoes: balance.transactions,
    });
  });
