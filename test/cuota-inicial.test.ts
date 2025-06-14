import { describe, expect, it } from "bun:test";
import { CuotaInicial, ETipoDeCuotaInicial } from "../src/cuota-inicial";
import Decimal from "decimal.js";

describe("Cuota Inicial", () => {
    it("deberia de calcular la cuota inicial de un capital cuando el valor es porcentual", () => {
        const cuotaInicial = new CuotaInicial(
            ETipoDeCuotaInicial.Porcentual,
            20
        );
        const capital = 3600;

        const resultado = cuotaInicial.calcularCuotaInicial(capital);
        expect(resultado).toBeInstanceOf(Decimal);
        expect(resultado.toNumber()).toBe(720);
    });

    it("deberia de calcular la cuota inicial de un capital cuando el valor es un monto fijo", () => {
        const cuotaInicial = new CuotaInicial(ETipoDeCuotaInicial.Valor, 1000);
        const capital = 3600;

        const resultado = cuotaInicial.calcularCuotaInicial(capital);
        expect(resultado).toBeInstanceOf(Decimal);
        expect(resultado.toNumber()).toBe(1000);
    });

    it("Deberia de calcular la cuota inicial cuando el capital es 1 800 000 y la cuota es de 20%", () => {
        const cuotaInicial = new CuotaInicial(ETipoDeCuotaInicial.Porcentual, 20);
        const capital = 1800000;
        const resultado = cuotaInicial.calcularCuotaInicial(capital);
        expect(resultado).toBeInstanceOf(Decimal);
        expect(resultado.toNumber()).toBe(360000);
    })
});
