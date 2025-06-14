import Decimal from "decimal.js";
import { Pago } from "./pago";
import type { PlanDePago } from "./plan-de-pago";

export enum EPeriodoDeGracia {
    Parcial = "Parcial",
    Total = "Total",
}
export class PeriodoDeGracia {
    public nroPeriodo: Decimal;
    public tipo: EPeriodoDeGracia = EPeriodoDeGracia.Parcial;

    constructor(nroPeriodo: number, tipo: EPeriodoDeGracia) {
        this.nroPeriodo = new Decimal(nroPeriodo);
        this.tipo = tipo;
    }

    seAplica(periodo: Decimal): boolean {
        return periodo.equals(this.nroPeriodo);
    }

    aplicar(planDePago: PlanDePago, proximoPago: Pago): void {
        if (this.tipo === EPeriodoDeGracia.Total) {
            proximoPago.cuota = proximoPago.amortizacion = new Decimal(0);
        } else {
            proximoPago.cuota = proximoPago.intereses;
            proximoPago.amortizacion = new Decimal(0);
        }

        throw new Error(
            "Metodo aplicar no implementado para el tipo de periodo de gracia: " +
                this.tipo
        );
    }
}
