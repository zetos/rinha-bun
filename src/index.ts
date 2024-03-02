import { Elysia, t } from 'elysia';
import { getBalance, transactionUpdateBalance } from './db';

const port = Number(Bun.env.PORT) || 3001;

const validateParamId = t.Object({
  id: t.Numeric(),
});

const app = new Elysia()
  .get(
    '/clientes/:id/extrato',
    async ({ params: { id }, set }) => {
      const balance = await getBalance(id);

      if (!balance) {
        set.status = 404;
        return 'user not found.';
      }

      return {
        saldo: {
          total: balance.bal,
          data_extrato: balance.current_time,
          limite: balance.lim,
        },
        ultimas_transacoes: balance.transactions[0].tipo ? balance.transactions : [],
      };
    },
    {
      params: validateParamId,
    },
  )
  .post(
    '/clientes/:id/transacoes',
    async ({ params: { id }, body, set }) => {
      // 🙈
      if (id > 5) {
        set.status = 404;
        return 'User not found';
      }

      const result = await transactionUpdateBalance(
        id,
        body.tipo,
        body.valor,
        body.descricao,
      );

      if (result.updated) {
        return {
          limite: result.lim,
          saldo: result.bal,
        };
      } else {
        set.status = 422;
        return 'invalid transaction.';
      }
    },
    {
      params: validateParamId,
      body: t.Object({
        valor: t.Integer(),
        tipo: t.Union([t.Literal('c'), t.Literal('d')]),
        descricao: t.String({ minLength: 1, maxLength: 10 }),
      }),
    },
  )
  .onError(({ error, set }) => {
    set.status = 500;
    return { msg: error.message, stack: error.stack };
  })
  .listen(port);

console.info(`App is running at ${app.server?.hostname}:${app.server?.port}`);
