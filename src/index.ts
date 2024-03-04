import { Byte, send, parse } from '@bit-js/byte';

import { getBalance, transactionUpdateBalance } from './db';
import { t, vld } from 'vld-ts';

const Post = t.obj({
  valor: t.int,
  tipo: t.vals('c', 'd'),
  descricao: t.str({ minLength: 1, maxLength: 10 }),
});

const NotFound = { status: 404 };
const Unprocessable = { status: 422 };
const BadRequest = { status: 400 };

export default new Byte()
  .get('/clientes/:id/extrato', async (ctx) => {
    const id = +ctx.params.id;
    if (id > 5) {
      return send.body('Not found', NotFound);
    }

    const balance = await getBalance(id);

    return send.json({
      saldo: {
        total: balance.bal,
        data_extrato: balance.current_time,
        limite: balance.lim,
      },
      ultimas_transacoes: balance.transactions[0].tipo ? balance.transactions : [],
    });
  })
  .post(
    '/clientes/:id/transacoes',
    {
      body: parse.json({
        then(data: typeof Post) {
          return vld(Post)(data) ? data : send.body('Bad request', BadRequest);
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
      if (id > 5) {
        return send.body('Not found', NotFound);
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
        return send.body('Bad transaction', Unprocessable);
      }
    },
  );
