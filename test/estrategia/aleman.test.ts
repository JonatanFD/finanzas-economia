
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
    it("Deberia de calcular el capital inicial del plan de pago aleman", () => {
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
        expect(metodoAleman.tasasDeInteres[0]?.tasa.obtenerTasaFormateada().toString()).toBe("3.0713679");
        expect(metodoAleman.tasasDeInteres[1]?.tasa.obtenerTasaFormateada().toString()).toBe("3.695113"); // deberia de haber un cero al final pero el redondeado no lo permite



    })
})