import { Byte, send, parse } from '@bit-js/byte';

import { getBalance, transactionUpdateBalance } from './db';
import { t, vld } from 'vld-ts';

const Post = t.obj({
  valor: t.int,
  tipo: t.vals('c', 'd'),
  descricao: t.str({ minLength: 1, maxLength: 10 }),
});

export default new Byte()
  .get('/clientes/:id/extrato', async (ctx) => {
    const id = Number(ctx.params.id);
    console.log('foo id:', id);
    if (id < 0) {
      return send.body('Not found', { status: 404 });
    }

    const balance = await getBalance(id);
    console.log('foo2', balance);

    if (!balance) {
      return send.body('Not found', { status: 404 });
    }
    console.log('foo3');

    return send.json({
      saldo: {
        total: balance.bal,
        data_extrato: balance.current_time,
        limite: balance.lim,
      },
      ultimas_transacoes: balance.transactions,
    });
  })
  .post(
    '/clientes/:id/transacoes',
    {
      body: parse.json({
        // Do parsing with request body if specified
        then(data: typeof Post) {
          // If a `Response` object is returned.
          // It will be used instead of the handler response.
          const foo = vld(Post);
          return foo(data) ? data : send.body('Bad request', { status: 400 });
          // return new Response('Hi');
        },
        // Handle error if specified
        catch(error) {
          // Should return a Response or Promise<Response>
          // throw error;
          return new Response(error);
        },
      }),
    },
    async (ctx) => {
      const id = +ctx.params.id;
      if (id < 0) {
        // cheat and add a clientId > 5 check?
        return send.body('Not found', { status: 404 });
      }
      const bodyData = ctx.state.body;

      const result = await transactionUpdateBalance(
        id,
        bodyData.tipo,
        bodyData.valor,
        bodyData.descricao,
      );

      if (result.updated) {
        return send.json({
          limite: result.lim,
          saldo: result.bal,
        });
      } else {
        return send.body('Bad transaction', { status: 422 });
      }
    },
  );
