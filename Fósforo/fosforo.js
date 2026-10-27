$(document).ready(function () {
    $('#novo').click(function () {
        if ($('.nfosforo').attr('src') == 'aceso.png') {
            alert('Você precisa apagar o fosforo para pegar um novo')
        } else {
            ($('.nfosforo').attr('src', 'fosforo.png'))
            alert('Você tem um novo fósforo')
        }
    });
    $('#acender').click(function () {
        if ($('.nfosforo').attr('src') == 'fosforo.png') {
            $('.nfosforo').attr('src', 'aceso.png')
            alert('Seu fósforo está aceso')
        } else {
            alert('Você precisa pegar um novo fósforo para acender')
        }
    });
    $('#apagar').click(function () {
        if ($('.nfosforo').attr('src') == 'aceso.png') {
            $('.nfosforo').attr('src', 'apagado.png')
            alert('Seu fósforo está apagado')
        } else {
            alert('Você precisa estar com o fosforo aceso')
        };
    });
});
