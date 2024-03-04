import { Byte, send, parse } from '@bit-js/byte';

import { getBalance, transactionUpdateBalance } from './db';
import { Type as t, type Static } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';

const Post = t.Object({
  valor: t.Integer(),
  tipo: t.Union([t.Literal('c'), t.Literal('d')]),
  descricao: t.String({ minLength: 1, maxLength: 10 }),
});

const PostC = TypeCompiler.Compile(Post);

const gambi = {
  '1': 0,
  '2': 0,
  '3': 0,
  '4': 0,
  '5': 0,
  //  total: 0
};

export default new Byte()
  .get('/clientes/:id/extrato', async (ctx) => {
    const id = +ctx.params.id;

    const balance = await getBalance(id);

    if (!balance) {
      return send.body('Not found', { status: 404 });
    }

    return send.json({
      saldo: {
        total: balance.bal,
        data_extrato: balance.current_time,
        limite: balance.lim,
      },
      ultimas_transacoes: balance.transactions[0].tipo
        ? balance.transactions
        : [],
    });
  })
  .post(
    '/clientes/:id/transacoes',
    {
      body: parse.json({
        then(data: Static<typeof Post>) {
          return PostC.Check(data) ? data : send.body(null, { status: 400 });
        },
        catch(error) {
          return new Response(error);
        },
      }),
    },
    async (ctx) => {
      const id = +ctx.params.id as 1 | 2 | 3 | 4 | 5;
      const bodyData = ctx.state.body;

      const isDebit = bodyData.tipo === 'd';

      // isDebit && gambi[id] && bodyData.valor >= gambi[id] blocks: 2043 + 1877 db requests
      // isDebit && gambi[id] blocks: 4969 + 4809

      if (isDebit && gambi[id]) {
        // gambi.total = gambi.total + 1;
        // console.log('::::: total:', gambi.total);
        return send.body(null, { status: 422 });
      } else {
        gambi[id] = 0;
      }

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
        gambi[id] = bodyData.valor;
        return send.body(null, { status: 422 });
      }
    },
  );
