$(document).ready(function () {
    $('#chaveabrir').click(function () {
        if ($('.abrir').attr('src') == 'cadeado.png') {
            $('.abrir').attr('src', 'cad_aberto.png')
        };
    });
    $('#cadeadofechar').click(function () {
        if ($('.abrir').attr('src') == 'cad_aberto.png') {
            $('.abrir').attr('src', 'cadeado.png')
        };
    });
});
