import Decimal from "decimal.js";
import type { PeriodoDeGracia } from "../periodo-de-gracia";
import { PlanDePago } from "../plan-de-pago";
import type { CuotaInicial } from "../cuota-inicial";
import type { IntervaloDeTasa } from "../intervalo-de-tasa";
import type { EPeriodo } from "../periodo";
import type { IntervaloDeTiempo } from "../intervalo-de-tiempo";
import { Pago } from "../pago";

export class MetodoAleman extends PlanDePago {
    constructor({
        deuda,
        cuotaInicial,
        tasas,
        frecuenciaDePago,
        plazo,
        periodosDeGracia,
    }: {
        deuda: Decimal;
        cuotaInicial: CuotaInicial;
        tasas: IntervaloDeTasa[];
        frecuenciaDePago: EPeriodo;
        plazo: IntervaloDeTiempo;
        periodosDeGracia: PeriodoDeGracia[];
    }) {
        super({
            deuda,
            frecuenciaDePago,
            plazo,
            tasasDeInteres: tasas,
            cuotaInicial,
            periodosDeGracia,
        });
    }

    public override calcularAmortizacion(): Decimal {
        const nroDePeriodosDeGracia = this.periodosDeGracia.length;

        const amortizacion = this.capitalInicial.dividedBy(
            this.periodos.minus(nroDePeriodosDeGracia)
        );
        return amortizacion;
    }

    public override calcularCuota(periodo: number): Decimal {
        return new Decimal(0);
    }

    public override calcularIntereses(): Decimal {
        console.log(
            "calculando intereses del periodo",
            this.pagoActual.periodo
        );
        const tasaDelPeriodo = this.tasasDeInteres.find((t) =>
            t.esAplicable(this.pagoActual.periodo)
        );
        if (!tasaDelPeriodo) {
            throw new Error(
                "No hay tasa de interes aplicable para el periodo actual"
            );
        }

        const intereses = tasaDelPeriodo.calcularValorDeTasa(
            this.pagoActual.saldoFinal
        );
        return intereses;
    }

    public override calcularSaldoFinal(): Decimal {
        return new Decimal(0);
    }

    public override calcularPlanDePago(periodo?: number) {
        // aplicamos la cuota inicial
        // periodo 0
        this.pagoActual.saldoInicial = this.pagoActual.saldoFinal =
            this.capitalInicial;

        for (let nro = 1; nro < this.periodos.toNumber(); nro++) {
            const proximosIntereses = this.calcularIntereses();
            const proximoAmortizacion = this.calcularAmortizacion();

            const nuevoPago = new Pago({
                saldoInicial: this.pagoActual.saldoFinal,
                intereses: proximosIntereses,
                amortizacion: proximoAmortizacion,
                periodo: nro,
                saldoFinal:
                    this.pagoActual.saldoFinal.minus(proximoAmortizacion),
                cuota: proximoAmortizacion.plus(proximosIntereses),
            });

            const periodoDeGracia = this.hayUnPeriodoDeGraciaAplicable(nro);

            if (periodoDeGracia) {
                periodoDeGracia.aplicar(this, nuevoPago);
            }
        }
    }
}
