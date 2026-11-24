package br.uneb.ecommerce.controller;

import br.uneb.ecommerce.dto.ProdutoMaisVendidoResponse;
import br.uneb.ecommerce.service.RelatorioService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/relatorios")
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioService relatorioService;

    /** RF10 - GET /api/relatorios/mais-vendidos?inicio=2026-11-01&fim=2026-11-30&limite=10 */
    @GetMapping("/mais-vendidos")
    public List<ProdutoMaisVendidoResponse> maisVendidos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int limite) {
        return relatorioService.maisVendidos(inicio, fim, limite);
    }
}
