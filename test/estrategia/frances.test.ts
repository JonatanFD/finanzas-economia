import { describe, it, expect } from "bun:test";
import Decimal from "decimal.js";
import { CuotaInicial, ETipoDeCuotaInicial } from "../../src/cuota-inicial";
import { EPeriodo } from "../../src/periodo";
import { IntervaloDeTiempo } from "../../src/intervalo-de-tiempo";
import { Tasa, TipoTasa } from "../../src/tasa";
import { IntervaloDeTasa } from "../../src/intervalo-de-tasa";
import { EPeriodoDeGracia, PeriodoDeGracia } from "../../src/periodo-de-gracia";
import { MetodoFrances } from "../../src/estrategia/frances";

describe("frances", () => {
    it("Deberia de calcular el plan de pago por el metodo frances", () => {
        const deuda = new Decimal("18_500");
        const cuotaInicial = new CuotaInicial(
            ETipoDeCuotaInicial.Porcentual,
            25
        );

        const frecuenciaDePago = EPeriodo.Cuatrimestral;
        const plazo = new IntervaloDeTiempo(2, EPeriodo.Anual);

        const tasa1 = new Tasa(TipoTasa.Efectiva, 9.5);
        const tasa2 = new Tasa(TipoTasa.Efectiva, 11.5);
        const tasas = [
            new IntervaloDeTasa(tasa1, 0, 3),
            new IntervaloDeTasa(tasa2, 4, 6),
        ];

        const periodoDeGracia1 = new PeriodoDeGracia(1, EPeriodoDeGracia.Total);
        const periodoDeGracia2 = new PeriodoDeGracia(
            2,
            EPeriodoDeGracia.Parcial
        );
        const periodosDeGracia = [periodoDeGracia1, periodoDeGracia2];

        const metodoFrances = new MetodoFrances({
            deuda,
            cuotaInicial,
            tasas,
            frecuenciaDePago,
            plazo,
            periodosDeGracia,
        });

        metodoFrances.calcularPlanDePago();
        const pagoBase = metodoFrances.pagoBase;
        expect(pagoBase.saldoInicial.toString()).toBe("13875");
        expect(pagoBase.saldoFinal.toString()).toBe("13875");
        expect(pagoBase.intereses.toString()).toBe("0");
        expect(pagoBase.amortizacion.toString()).toBe("0");


        const pago1 = pagoBase.pagoSiguiente; // periodo de gracia total
        expect(pago1?.saldoInicial.toString()).toBe("13875");
        expect(pago1?.intereses.toDecimalPlaces(2).toString()).toBe("426.15");
        expect(pago1?.amortizacion.toString()).toBe("0");
        expect(pago1?.cuota.toString()).toBe("0");
        expect(pago1?.saldoFinal.toString().slice(0, 8)).toBe("14301.15");

        const pago2 = pago1?.pagoSiguiente; // periodo de gracia parcial
        expect(pago2?.saldoInicial.toString().slice(0, 8)).toBe("14301.15");
        expect(pago2?.intereses.toDecimalPlaces(2).toString()).toBe("439.24");
        expect(pago2?.amortizacion.toString()).toBe("0");
        expect(pago2?.cuota.toDecimalPlaces(2).toString()).toBe("439.24");
        expect(pago2?.saldoFinal.toString().slice(0, 8)).toBe("14301.15");

        const pago3 = pago2?.pagoSiguiente; // periodo de gracia parcial
        expect(pago3?.saldoInicial.toString().slice(0, 8)).toBe("14301.15");
        expect(pago3?.intereses.toDecimalPlaces(2).toString()).toBe("439.24");
        expect(pago3?.cuota.toDecimalPlaces(2).toString()).toBe("3853.97");
        expect(pago3?.amortizacion.toDecimalPlaces(3).toString()).toBe("3414.72");
        expect(pago3?.saldoFinal.toString().slice(0, 8)).toBe("10886.43");

        const pago4 = pago3?.pagoSiguiente; // periodo de gracia parcial
        expect(pago4?.saldoInicial.toString().slice(0, 8)).toBe("10886.43");
        expect(pago4?.intereses.toDecimalPlaces(2).toString()).toBe("402.27");
        expect(pago4?.amortizacion.toDecimalPlaces(3).toString()).toBe("3497.96");
        expect(pago4?.cuota.toDecimalPlaces(2).toString()).toBe("3900.23");
        expect(pago4?.saldoFinal.toDecimalPlaces(2).toString()).toBe("7388.46");

        const pago5 = pago4?.pagoSiguiente; // periodo de gracia parcial
        expect(pago5?.saldoInicial.toDecimalPlaces(2).toString()).toBe("7388.46");
        expect(pago5?.intereses.toDecimalPlaces(2).toString()).toBe("273.01");
        expect(pago5?.amortizacion.toDecimalPlaces(3).toString()).toBe("3627.22");
        expect(pago5?.cuota.toDecimalPlaces(2).toString()).toBe("3900.23");
        expect(pago5?.saldoFinal.toDecimalPlaces(2).toString()).toBe("3761.25");

        const pago6 = pago5?.pagoSiguiente; // periodo de gracia parcial
        expect(pago6?.saldoInicial.toDecimalPlaces(2).toString()).toBe("3761.25");
        expect(pago6?.intereses.toDecimalPlaces(2).toString()).toBe("138.98");
        expect(pago6?.amortizacion.toDecimalPlaces(3).toString()).toBe("3761.25");
        expect(pago6?.cuota.toDecimalPlaces(3).toString()).toBe("3900.23");
        expect(pago6?.saldoFinal.toDecimalPlaces(2).toString()).toBe("0");

        expect(metodoFrances.tasasDeInteres[0]?.tasa.obtenerTasaFormateada().toString()).toBe("3.0713679");
        expect(metodoFrances.tasasDeInteres[1]?.tasa.obtenerTasaFormateada().toString()).toBe("3.695113"); // deberia de haber
    });
});
