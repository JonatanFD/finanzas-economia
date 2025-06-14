import { describe, expect, it } from "bun:test";
import { Tasa, TipoTasa } from "../src/tasa";
import { EPeriodo } from "../src/periodo";

describe("Tasa", () => {
    it("Deberia de crear una instancia de la clase Tasa", () => {
        const tasa = new Tasa(TipoTasa.Nominal, 10);
        expect(tasa).toBeInstanceOf(Tasa);
    });

    it("Deberia de ser una tasa nominal", () => {
        const tasa = new Tasa(TipoTasa.Nominal, 10);
        expect(tasa.tipo).toBe(TipoTasa.Nominal);
    });

    it("Deberia de ser una tasa efectiva", () => {
        const tasa = new Tasa(TipoTasa.Efectiva, 10);
        expect(tasa.tipo).toBe(TipoTasa.Efectiva);
    });

    it("Deberia de convertir a una tasa efectiva anual desde una tasa nominal cuatrimestral con capitalizacion mensual", () => {
        const tasaNominal = new Tasa(
            TipoTasa.Nominal,
            6,
            EPeriodo.Cuatrimestral,
            EPeriodo.Mensual
        );
        const tasaEfectiva = tasaNominal.convertirAEfectiva(
            EPeriodo.Anual,
            EPeriodo.Mensual
        );

        expect(tasaEfectiva.tipo).toBe(TipoTasa.Efectiva);
        expect(tasaEfectiva.periodo.valor).toBe(EPeriodo.Anual);
        expect(tasaEfectiva.capitalizacion.valor).toBe(EPeriodo.Mensual);
        expect(tasaEfectiva.obtenerTasaFormateada().toString()).toBe("19.5618171"); // 10 * 12 = 120
    });

    it("Deberia de convertir a una tasa efectiva trimestral desde una tasa nominal anual de 18% con capitalizacion quincenal", () => {
        const tasaNominal = new Tasa(
            TipoTasa.Nominal,
            18,
            EPeriodo.Anual,
            EPeriodo.Quincenal
        );
        const tasaEfectiva = tasaNominal.convertirAEfectiva(
            EPeriodo.Trimestral,
            EPeriodo.Quincenal
        );

        expect(tasaEfectiva.tipo).toBe(TipoTasa.Efectiva);
        expect(tasaEfectiva.periodo.valor).toBe(EPeriodo.Trimestral);
        expect(tasaEfectiva.capitalizacion.valor).toBe(EPeriodo.Quincenal);
        expect(tasaEfectiva.obtenerTasaFormateada().toString()).toBe("4.5852235"); // 18 * 4 = 72
    });

    it("Deberia de convertir a una tasa nominal anual desde una tasa efectiva mensual de 4% con capitalizacion diaria", () => {
        const tasaEfectiva = new Tasa(
            TipoTasa.Efectiva,
            4,
            EPeriodo.Mensual,
            EPeriodo.Diaria
        );
        const tasaNominal = tasaEfectiva.convertirANominal(
            EPeriodo.Anual,
            EPeriodo.Diaria
        );

        expect(tasaNominal.tipo).toBe(TipoTasa.Nominal);
        expect(tasaNominal.periodo.valor).toBe(EPeriodo.Anual);
        expect(tasaNominal.capitalizacion.valor).toBe(EPeriodo.Diaria);
        expect(tasaNominal.obtenerTasaFormateada().toString()).toBe("47.0956345"); // 4 * 12 = 48
    });

    it("Deberia de convertir a una tasa nominal semestral con una capitalizacion bimestral equivalente a una TEA de 36%", () => {

        const tasaEfectiva = new Tasa(
            TipoTasa.Efectiva,
            36,
            EPeriodo.Anual,
            EPeriodo.Bimestral
        );

        const tasaNominal = tasaEfectiva.convertirANominal(
            EPeriodo.Semestral,
            EPeriodo.Bimestral
        );

        expect(tasaNominal.tipo).toBe(TipoTasa.Nominal);
        expect(tasaNominal.periodo.valor).toBe(EPeriodo.Semestral);
        expect(tasaNominal.capitalizacion.valor).toBe(EPeriodo.Bimestral);
        expect(tasaNominal.obtenerTasaFormateada().toString()).toBe("15.7749968"); // 36 * 12 = 432
    })

    it("Deberia de convertir a una tasa nominal bimestral con capitalzacion mensual desde una tasa nominal anual de 18% con capitalizacion diaria", () => {


        const tasaNominalInicio = new Tasa(
            TipoTasa.Nominal,
            18,
            EPeriodo.Anual,
            EPeriodo.Diaria
        );
        
        const nuevaTasaNominal = tasaNominalInicio.convertirANominal(
            EPeriodo.Bimestral,
            EPeriodo.Mensual
        );

        expect(nuevaTasaNominal.tipo).toBe(TipoTasa.Nominal);
        expect(nuevaTasaNominal.periodo.valor).toBe(EPeriodo.Bimestral);
        expect(nuevaTasaNominal.capitalizacion.valor).toBe(EPeriodo.Mensual);
        expect(nuevaTasaNominal.obtenerTasaFormateada().toString()).toBe("3.0218518"); // 18 * 6 = 72
    })

    it("Deberia de convertir a una tasa efectiva anual desde una tasa efectiva mensual de 4%", () => {
        const tasaEfectivaMensual = new Tasa(
            TipoTasa.Efectiva,
            4,
            EPeriodo.Mensual,
        );

        // Se asume que es diaria la capitalizacion
        const tasaEfectivaAnual = tasaEfectivaMensual.convertirAEfectiva(
            EPeriodo.Anual,
        );

        expect(tasaEfectivaAnual.tipo).toBe(TipoTasa.Efectiva);
        expect(tasaEfectivaAnual.periodo.valor).toBe(EPeriodo.Anual);
        expect(tasaEfectivaAnual.capitalizacion.valor).toBe(EPeriodo.Diaria);
        expect(tasaEfectivaAnual.obtenerTasaFormateada().toString()).toBe("60.1032219"); // 4 * 12 = 48
    })


    it("Deberia de convertir a una tasa efectiva cuatrimestral desde una tasa efectiva anual de 9.50%", () =>{
        const tasaEfectivaAnual = new Tasa(
            TipoTasa.Efectiva,
            9.50,
            EPeriodo.Anual,
        );

        const tasaEfectivaSemestral = tasaEfectivaAnual.convertirAEfectiva(
            EPeriodo.Cuatrimestral,
        );

        expect(tasaEfectivaSemestral.tipo).toBe(TipoTasa.Efectiva);
        expect(tasaEfectivaSemestral.periodo.valor).toBe(EPeriodo.Cuatrimestral);
        expect(tasaEfectivaSemestral.capitalizacion.valor).toBe(EPeriodo.Diaria);
        expect(tasaEfectivaSemestral.obtenerTasaFormateada().toString()).toBe("3.0713679"); // 9.50 * 12 = 108
    })
});
