import { MercadoPagoConfig, Preference } from 'mercadopago'
import { NextResponse } from 'next/server'

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })

export async function POST(req) {
  try {
    const { viajeId, origen, destino, precio, asientos, pasajeroId } = await req.json()

    const preference = new Preference(client)
    const result = await preference.create({
      body: {
        items: [{
          id: viajeId,
          title: `Carpul Car — ${origen} → ${destino}`,
          quantity: asientos,
          unit_price: Number(precio),
          currency_id: 'ARS',
        }],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/pago-exitoso?viaje_id=${viajeId}&pasajero_id=${pasajeroId}&asientos=${asientos}&status=success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/viaje/${viajeId}?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/pago-exitoso?viaje_id=${viajeId}&pasajero_id=${pasajeroId}&asientos=${asientos}&status=pending`,
        },
        auto_return: 'approved',
        statement_descriptor: 'Carpul Car',
      }
    })

    return NextResponse.json({ init_point: result.init_point, sandbox_init_point: result.sandbox_init_point })
  } catch (err) {
    console.error('MP error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
