$(document).ready(function () {
    $('#trocarimagem').click(function () {
        if ($('.imagem').attr('src') == 'lampapagada.png') {
            $('.imagem').attr('src', 'lampacesa.png')
            $('.botao').text('Desligar')

        } else {
            $('.imagem').attr('src', 'lampapagada.png')
            $('.botao').text('Acender')

        };
    });
});
