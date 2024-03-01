// import { routes } from "@stricjs/app";
// import { text, json, status } from "@stricjs/app/send";
// import { jsonv } from "@stricjs/app/parser";
// import { t, vld } from "vld-ts";

// import { getBalance, transactionUpdateBalance } from "./db";

// const Post = t.obj({
//   valor: t.int,
//   tipo: t.vals("c", "d"),
//   descricao: t.str({ minLength: 1, maxLength: 10 }),
// });

// // Define and export your routes
// export default routes()
//   .get("/", () => text("Welcome to Stric!"))
//   .get("/f/clientes/:id/extrato", async (ctx) => {
//     const id = Number(ctx.params.id);
//     if (id < 0) {
//       // cheat and add a clientId > 5 check?
//       return status(null, 404);
//     }

//     const balance = await getBalance(id);

//     if (!balance) {
//       return status(null, 404);
//     }

//     return json({
//       saldo: {
//         total: balance.bal,
//         data_extrato: balance.current_time,
//         limite: balance.lim,
//       },
//       ultimas_transacoes: balance.transactions,
//     });
//   })
//   .state({ post: jsonv(vld(Post)) })
//   .reject(() => status("Bad Request.", 400))
//   .post("/f/clientes/:id/transacoes", async (ctx) => {
//     const id = Number(ctx.params.id);
//     if (id < 0) {
//       // cheat and add a clientId > 5 check?
//       return status(null, 404);
//     }
//     console.log("id:", id);
//     console.log("body:", ctx.state);
//     const bodyData = ctx.state;

//     // return json(ctx.state);
//     const result = await transactionUpdateBalance(
//       id,
//       bodyData.tipo,
//       bodyData.valor,
//       bodyData.descricao
//     );

//     if (result.updated) {
//       return json({
//         limite: result.lim,
//         saldo: result.bal,
//       });
//     } else {
//       return status(null, 422);
//     }
//   });
