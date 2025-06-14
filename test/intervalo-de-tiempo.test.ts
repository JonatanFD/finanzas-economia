import { describe, expect, it } from "bun:test";
import { IntervaloDeTiempo } from "../src/intervalo-de-tiempo";
import { EPeriodo } from "../src/periodo";

describe("Intervalo de tiempo", () => {
    it("Deberia de convertir un intervalo de tiempo de 1 año a un intervalo de tiempo de 12 meses", () => {
        const intervaloDeTiempo = new IntervaloDeTiempo(1, EPeriodo.Anual);
        const nuevoIntervalo = intervaloDeTiempo.convertirA(EPeriodo.Mensual);

        expect(nuevoIntervalo.valor.toString()).toBe("12");
        expect(nuevoIntervalo.unidad).toBe(EPeriodo.Mensual);
    });

    it("Deberia de convertir un intervalo de tiempo de 1 año a trimestres", () => {
        const intervaloDeTiempo = new IntervaloDeTiempo(1, EPeriodo.Anual);
        const nuevoIntervalo = intervaloDeTiempo.convertirA(EPeriodo.Trimestral);

        expect(nuevoIntervalo.valor.toString()).toBe("4");
        expect(nuevoIntervalo.unidad).toBe(EPeriodo.Trimestral);
    });

    it("Deberia de convertir un intervalo de tiempo de 1 año a semestres", () => {
        const intervaloDeTiempo = new IntervaloDeTiempo(1, EPeriodo.Anual);
        const nuevoIntervalo = intervaloDeTiempo.convertirA(EPeriodo.Semestral);

        expect(nuevoIntervalo.valor.toString()).toBe("2");
        expect(nuevoIntervalo.unidad).toBe(EPeriodo.Semestral);
    });
});