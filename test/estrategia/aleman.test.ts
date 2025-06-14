
import Decimal from 'decimal.js';
import { describe, it, expect } from 'bun:test';
import { CuotaInicial, ETipoDeCuotaInicial } from '../../src/cuota-inicial';
import { EPeriodo } from '../../src/periodo';
import { IntervaloDeTiempo } from '../../src/intervalo-de-tiempo';
import { IntervaloDeTasa } from '../../src/intervalo-de-tasa';
import { Tasa, TipoTasa } from '../../src/tasa';
import { EPeriodoDeGracia, PeriodoDeGracia } from '../../src/periodo-de-gracia';
import { MetodoAleman } from '../../src/estrategia/aleman';


describe("Refactor de Plan de Pago", () => {
    it("Deberia de calcular el plan de pago aleman", () => {
        const deuda = new Decimal("18_500");
        const cuotaInicial = new CuotaInicial(ETipoDeCuotaInicial.Porcentual, 25);

        const frecuenciaDePago = EPeriodo.Cuatrimestral;
        const plazo = new IntervaloDeTiempo(2, EPeriodo.Anual);

        const tasa1 = new Tasa(TipoTasa.Efectiva, 9.50)
        const tasa2 = new Tasa(TipoTasa.Efectiva, 11.50)
        const tasas = [new IntervaloDeTasa(tasa1, 0, 3), new IntervaloDeTasa(tasa2, 4, 6)];

        const periodoDeGracia1 = new PeriodoDeGracia(1, EPeriodoDeGracia.Total)
        const periodoDeGracia2 = new PeriodoDeGracia(2, EPeriodoDeGracia.Parcial)
        const periodosDeGracia = [periodoDeGracia1, periodoDeGracia2];

        const metodoAleman = new MetodoAleman({
            deuda,
            cuotaInicial,
            tasas,
            frecuenciaDePago,
            plazo,
            periodosDeGracia,
        });
        metodoAleman.calcularPlanDePago();

        expect(metodoAleman.pagoBase.saldoInicial.toString()).toBe("13875");
        expect(metodoAleman.pagoBase.saldoFinal.toString()).toBe("13875");
        expect(metodoAleman.pagoBase.intereses.toString()).toBe("0");
        expect(metodoAleman.pagoBase.amortizacion.toString()).toBe("0");
        expect(metodoAleman.pagoBase.cuota.toString()).toBe("0");

        const pago1 = metodoAleman.pagoBase.pagoSiguiente; // periodo de gracia total
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
        expect(pago3?.amortizacion.toDecimalPlaces(3).toString()).toBe("3575.288");
        expect(pago3?.cuota.toDecimalPlaces(2).toString()).toBe("4014.53");
        expect(pago3?.saldoFinal.toString().slice(0, 8)).toBe("10725.86");

        const pago4 = pago3?.pagoSiguiente; // periodo de gracia parcial
        expect(pago4?.saldoInicial.toString().slice(0, 8)).toBe("10725.86");
        expect(pago4?.intereses.toDecimalPlaces(2).toString()).toBe("396.33");
        expect(pago4?.amortizacion.toDecimalPlaces(3).toString()).toBe("3575.288");
        expect(pago4?.cuota.toDecimalPlaces(2).toString()).toBe("3971.62");
        expect(pago4?.saldoFinal.toDecimalPlaces(2).toString()).toBe("7150.58");

        const pago5 = pago4?.pagoSiguiente; // periodo de gracia parcial
        expect(pago5?.saldoInicial.toDecimalPlaces(2).toString()).toBe("7150.58");
        expect(pago5?.intereses.toDecimalPlaces(2).toString()).toBe("264.22");
        expect(pago5?.amortizacion.toDecimalPlaces(3).toString()).toBe("3575.288");
        expect(pago5?.cuota.toDecimalPlaces(2).toString()).toBe("3839.51");
        expect(pago5?.saldoFinal.toDecimalPlaces(2).toString()).toBe("3575.29");

        const pago6 = pago5?.pagoSiguiente; // periodo de gracia parcial
        expect(pago6?.saldoInicial.toDecimalPlaces(2).toString()).toBe("3575.29");
        expect(pago6?.intereses.toDecimalPlaces(2).toString()).toBe("132.11");
        expect(pago6?.amortizacion.toDecimalPlaces(3).toString()).toBe("3575.288");
        expect(pago6?.cuota.toDecimalPlaces(3).toString()).toBe("3707.399");
        expect(pago6?.saldoFinal.toDecimalPlaces(2).toString()).toBe("0");

        expect(metodoAleman.tasasDeInteres[0]?.tasa.obtenerTasaFormateada().toString()).toBe("3.0713679");
        expect(metodoAleman.tasasDeInteres[1]?.tasa.obtenerTasaFormateada().toString()).toBe("3.695113"); // deberia de haber un cero al final pero el redondeado no lo permite
    })

    it("Deberia de calcular el plan de pago aleman con periodos de gracia parciales", () => {
         const deuda = new Decimal("3_600");
        const cuotaInicial = new CuotaInicial(ETipoDeCuotaInicial.Porcentual, 20);

        const frecuenciaDePago = EPeriodo.Semestral;
        const plazo = new IntervaloDeTiempo(3, EPeriodo.Anual);

        const tasa1 = new Tasa(TipoTasa.Efectiva, 24)
        const tasas = [new IntervaloDeTasa(tasa1, 0, plazo.convertirA(frecuenciaDePago).valor.toNumber())];

        const metodoAleman = new MetodoAleman({
            deuda,
            cuotaInicial,
            tasas,
            frecuenciaDePago,
            plazo,
            periodosDeGracia: [],
        });

        metodoAleman.calcularPlanDePago();

        expect(metodoAleman.pagoBase.saldoInicial.toString()).toBe("2880");
        expect(metodoAleman.pagoBase.saldoFinal.toString()).toBe("2880");
        expect(metodoAleman.pagoBase.intereses.toString()).toBe("0");
        expect(metodoAleman.pagoBase.amortizacion.toString()).toBe("0");
        expect(metodoAleman.pagoBase.cuota.toString()).toBe("0");

        const pago1 = metodoAleman.pagoBase.pagoSiguiente; // periodo de gracia total
        expect(pago1?.saldoInicial.toString()).toBe("2880");
        expect(pago1?.intereses.toDecimalPlaces(2).toString()).toBe("327.03");
        expect(pago1?.amortizacion.toString()).toBe("480");
        expect(pago1?.cuota.toDecimalPlaces(2).toString()).toBe("807.03");
        expect(pago1?.saldoFinal.toString()).toBe("2400");

        const pago2 = pago1?.pagoSiguiente; // periodo de gracia parcial
        expect(pago2?.saldoInicial.toString()).toBe("2400");
        expect(pago2?.intereses.toDecimalPlaces(2).toString()).toBe("272.53");// un decimal esta mal
        expect(pago2?.amortizacion.toString()).toBe("480");
        expect(pago2?.cuota.toDecimalPlaces(2).toString()).toBe("752.53");
        expect(pago2?.saldoFinal.toString()).toBe("1920");

        const pago3 = pago2?.pagoSiguiente; // periodo de gracia parcial
        expect(pago3?.saldoInicial.toString()).toBe("1920");
        expect(pago3?.intereses.toDecimalPlaces(2).toString()).toBe("218.02");
        expect(pago3?.amortizacion.toString()).toBe("480");
        expect(pago3?.cuota.toDecimalPlaces(2).toString()).toBe("698.02");
        expect(pago3?.saldoFinal.toString()).toBe("1440");

        const pago4 = pago3?.pagoSiguiente; // periodo de gracia parcial
        expect(pago4?.saldoInicial.toString()).toBe("1440");
        expect(pago4?.intereses.toDecimalPlaces(2).toString()).toBe("163.52");
        expect(pago4?.amortizacion.toString()).toBe("480");
        expect(pago4?.cuota.toDecimalPlaces(2).toString()).toBe("643.52");
        expect(pago4?.saldoFinal.toString()).toBe("960");

        const pago5 = pago4?.pagoSiguiente; // periodo de gracia parcial
        expect(pago5?.saldoInicial.toString()).toBe("960");
        expect(pago5?.intereses.toDecimalPlaces(2).toString()).toBe("109.01");
        expect(pago5?.amortizacion.toString()).toBe("480");
        expect(pago5?.cuota.toDecimalPlaces(2).toString()).toBe("589.01");
        expect(pago5?.saldoFinal.toString()).toBe("480");

        const pago6 = pago5?.pagoSiguiente; // periodo de gracia parcial
        expect(pago6?.saldoInicial.toString()).toBe("480");
        expect(pago6?.intereses.toDecimalPlaces(2).toString()).toBe("54.51");
        expect(pago6?.amortizacion.toString()).toBe("480");
        expect(pago6?.cuota.toDecimalPlaces(2).toString()).toBe("534.51");
        expect(pago6?.saldoFinal.toString()).toBe("0");

        expect(metodoAleman.tasasDeInteres[0]?.tasa.obtenerTasaFormateada().toString()).toBe("11.3552873");

    });
})