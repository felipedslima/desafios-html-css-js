$(document).ready(function () {

    var x = $(window).width() / 2 - 125;
    var y = $(window).height() / 2 - 100;

    var gasolina = 100;
    var turbo = 100;
    var bateu = false;
    var vertical = false;
    var lado = 1;
    var teclas = {};
    var elemento = $('#carro');

    function aplicarRotacao(tecla) {
        if (tecla == 37) lado = -1;
        if (tecla == 39) lado = 1;

        var angulo = 0;
        if (tecla == 38) angulo = -90 * lado;
        if (tecla == 40) angulo = 90 * lado;

        vertical = angulo !== 0;
        elemento.css('transform',
            'rotate(' + angulo + 'deg) scaleX(' + lado + ')');
    }

    function mostrarAviso(texto) {
        $('#aviso').text(texto).show();
    }

    aplicarRotacao(39);

    $(document).keydown(function (e) {
        if ((e.which >= 37 && e.which <= 40) || e.which == 32)
            e.preventDefault();

        teclas[e.which] = true;

        if (e.which == 82) {
            gasolina = 100;
            turbo = 100;
            bateu = false;
            x = $(window).width() / 2 - 125;
            y = $(window).height() / 2 - 100;
            elemento.attr('src', 'carro.png');
            aplicarRotacao(39);
            $('#aviso').hide();
        }
        if (!bateu && e.which >= 37 && e.which <= 40) {
            aplicarRotacao(e.which);
        }
    });

    $(document).keyup(function (e) {
        teclas[e.which] = false;
    });

    setInterval(function () {
        var velocidade = 7;
        var gasto = 0.05;
        var andando = false;
        var turboAtivo = false;

        var w = elemento.width();
        var h = elemento.height();
        var vw = vertical ? h : w;
        var vh = vertical ? w : h;

        var min_x = (vw - w) / 2;
        var max_x = $(window).width() - (w + vw) / 2;
        var min_y = (vh - h) / 2;
        var max_y = $(window).height() - (h + vh) / 2;

        if (gasolina > 0 && !bateu) {
            if (teclas[32] && turbo > 0) {
                turboAtivo = true;
                velocidade = velocidade * 2;
                gasto = gasto * 5;
            }
            if (teclas[37]) { x = x - velocidade; andando = true; }
            if (teclas[38]) { y = y - velocidade; andando = true; }
            if (teclas[39]) { x = x + velocidade; andando = true; }
            if (teclas[40]) { y = y + velocidade; andando = true; }

            if (andando) {
                gasolina = gasolina - gasto;
            }
            if (turboAtivo) {
                turbo = turbo - 0.2;
                elemento.addClass('turbo');
            } else {
                turbo = turbo + 0.2;
                elemento.removeClass('turbo');
            }
            turbo = Math.max(0, Math.min(turbo, 100));

            if (x < min_x || x > max_x || y < min_y || y > max_y) {
                bateu = true;
                elemento.attr('src', 'batido.png');
                elemento.removeClass('turbo');
                mostrarAviso('Você bateu! Aperte R para reiniciar');
            }
        }

        x = Math.max(min_x, Math.min(x, max_x));
        y = Math.max(min_y, Math.min(y, max_y));

        if (gasolina <= 0 && !bateu) {
            gasolina = 0;
            mostrarAviso('Sua gasolina acabou. Aperte R para reabastecer');
        }

        $('#gasolina').css('width', gasolina + '%');
        $('#turbo').css('width', turbo + '%');
        elemento.css({ left: x + 'px', top: y + 'px' });
    }, 10);
});