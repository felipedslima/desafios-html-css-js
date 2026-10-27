$(document).ready(function () {
    const MAX_DIGITOS = Infinity;
    const calculadora = {
        somar: (a, b) => a + b,
        subtrair: (a, b) => a - b,
        multiplicar: (a, b) => a * b,
        dividir: (a, b) => b === 0 ? 'Undefined' : a / b,
    };

    const operacoes = {
        '+': calculadora.somar,
        '-': calculadora.subtrair,
        'x': calculadora.multiplicar,
        '÷': calculadora.dividir,
    };

    const historicoMax = 5;
    let historicoOperacoes = [];
    let valorAtual = '0';
    let expressaoX = [];
    let novoNumero = false;
    let percentualDigitado = null;
    let percentualPendente = false;
    let negativoFechado = false;
    let rotulosPercentual = {};

    const limpartxt = 'AC';
    const apagartxt = '⌫';
    const $btnLimpar = $('.teclado button').filter(function () {
        return $(this).text().trim() === limpartxt;
    });

    let $lista = $('.lista-historico');

    function renderHistorico() {
        $lista.empty();
        historicoOperacoes.forEach(function (item) {
            $('<li></li>')
                .append($('<span class="hist-expressao"></span>').text(item.expressao))
                .append($('<span class="hist-resultado"></span>').text(item.resultado))
                .appendTo($lista);
        });
    }

    function registrarHistorico(expressao, resultado) {
        historicoOperacoes.unshift({ expressao: expressao, resultado: resultado });
        historicoOperacoes = historicoOperacoes.slice(0, historicoMax);
        renderHistorico();
    }

    function formatarResultado(n) {
        let s = String(parseFloat(n.toFixed(10)));
        if (s.replace(/[-.]/g, '').length <= MAX_DIGITOS) return s;
        return String(parseFloat(n.toPrecision(MAX_DIGITOS)));
    }

    function mostrarNoDisplay(texto) {
        const $display = $('.display');
        $display.text(texto);

        if (!$display.hasClass('resultado-ajustado')) {
            $display.scrollLeft($display[0].scrollWidth);
        } else {
            $display.scrollLeft(0);
        }
        atualizarBotaoLimpar();
    }

    function estaDigitando() {
        return percentualPendente || (!novoNumero && valorAtual !== '0');
    }

    function atualizarBotaoLimpar() {
        $btnLimpar.text(estaDigitando() ? apagartxt : limpartxt);
    }

    function apagar() {
        $('.display').removeClass('resultado-ajustado');

        if (percentualPendente) {
            percentualPendente = false;
            attDisplay();
            return;
        }

        if (!estaDigitando()) return;

        negativoFechado = false;

        if (valorAtual.includes('e')) {
            valorAtual = '0';
        } else {
            valorAtual = valorAtual.slice(0, -1);
        }

        if (valorAtual === '' || valorAtual === '-') {
            valorAtual = '0';
            if (expressaoX.length > 0) novoNumero = true;
        }
        attDisplay();
    }

    function agruparN(valorStr) {
        if (/e/i.test(valorStr)) return valorStr.replace('.', ',');

        const negativo = valorStr.startsWith('-');
        const [inteira, decimal] = valorStr.replace('-', '').split('.');
        const agrupada = inteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        return (negativo ? '-' : '') + agrupada + (decimal !== undefined ? ',' + decimal : '');
    }

    function formatoDisplay(valor, segundoNumero = false) {
        if (valor === '-0') return '0';

        let valorStr = agruparN(String(valor));

        if (segundoNumero && valorStr.startsWith('-')) {
            return '(' + valorStr + ')';
        }
        return valorStr;
    }

    function formatoEntrada(valor) {
        if (valor === '-0' || valor === '-') return '(-0)';
        return formatoDisplay(valor, true);
    }

    function formatoPercentual(p) {
        const s = agruparN(String(p));
        return s.startsWith('-') ? '(' + s + ')%' : s + '%';
    }

    function textoToken(item, idx, valorX, rotulos = rotulosPercentual) {
        if (typeof item !== 'number') return item;
        if (Object.is(item, -0)) return '(-0)';
        if (rotulos[idx] !== undefined) return formatoPercentual(rotulos[idx]);
        return formatoDisplay(item, true);
    }

    function attDisplay() {
        const partes = expressaoX.map((item, idx, valorX) => textoToken(item, idx, valorX));
        const temOperador = expressaoX.length > 0;

        if (percentualPendente) {
            partes.push(formatoPercentual(valorAtual));
        } else if (!novoNumero || !temOperador) {
            partes.push(formatoEntrada(valorAtual));
        }

        mostrarNoDisplay(partes.join(' '));
    }

    function mostrarErro(mensagem) {
        valorAtual = '0';
        expressaoX = [];
        rotulosPercentual = {};
        percentualDigitado = null;
        percentualPendente = false;
        negativoFechado = false;
        novoNumero = true;
        mostrarNoDisplay(mensagem);
    }

    function avaliarExpressao(valorX) {
        const pilha = [valorX[0]];
        for (let i = 1; i < valorX.length; i += 2) {
            const op = valorX[i];
            const n = valorX[i + 1];
            if (op === 'x' || op === '÷') {
                const r = operacoes[op](pilha.pop(), n);
                if (typeof r !== 'number') return 'Undefined';
                pilha.push(r);
            } else {
                pilha.push(op, n);
            }
        }

        let res = pilha[0];
        for (let i = 1; i < pilha.length; i += 2) {
            res = operacoes[pilha[i]](res, pilha[i + 1]);
        }

        return (typeof res === 'number' && isFinite(res)) ? res : 'Undefined';
    }

    function aplicarPercentual() {
        percentualPendente = false;

        const v = parseFloat(valorAtual);
        if (isNaN(v)) {
            attDisplay();
            return false;
        }

        let r = v / 100;
        const op = expressaoX[expressaoX.length - 1];

        if (op === '+' || op === '-') {
            const base = avaliarExpressao(expressaoX.slice(0, -1));
            if (typeof base === 'string') {
                mostrarErro(base);
                return false;
            }
            r = base * v / 100;
        }

        percentualDigitado = v;
        valorAtual = String(parseFloat(r.toPrecision(15)));
        return true;
    }

    function calcular() {
        if (expressaoX.length === 0) return false;
        if (percentualPendente && !aplicarPercentual()) return false;

        const segundoValor = parseFloat(valorAtual);
        if (isNaN(segundoValor)) return false;

        const valorXCompletos = [...expressaoX, segundoValor];
        const resultado = avaliarExpressao(valorXCompletos);

        if (typeof resultado === 'string') {
            mostrarErro(resultado);
            return false;
        }

        const resultadoFinal = formatarResultado(resultado);

        const rotulos = { ...rotulosPercentual };
        if (percentualDigitado !== null) rotulos[valorXCompletos.length - 1] = percentualDigitado;

        const expressaoTexto = valorXCompletos
            .map((item, idx) => textoToken(item, idx, valorXCompletos, rotulos))
            .join(' ') + ' =';

        $('.historico').text(expressaoTexto);
        registrarHistorico(expressaoTexto, formatoDisplay(resultadoFinal, false));

        valorAtual = resultadoFinal;
        expressaoX = [];
        rotulosPercentual = {};
        percentualDigitado = null;
        negativoFechado = false;
        novoNumero = true;

        $('.display').addClass('resultado-ajustado');
        mostrarNoDisplay(formatoDisplay(valorAtual, false));
        return true;
    }

    function multiplicacaoImplicita() {
        if (!negativoFechado) return;
        escolherOperador('x');
    }

    function digitar(numero) {
        $('.display').removeClass('resultado-ajustado');
        multiplicacaoImplicita();

        if (valorAtual === '-' || valorAtual === '-0') {
            valorAtual = '-' + numero;
            novoNumero = false;
        } else if (novoNumero || valorAtual === '0') {
            valorAtual = numero;
            novoNumero = false;
        } else if (valorAtual.replace(/[-.]/g, '').length < MAX_DIGITOS) {
            valorAtual += numero;
        }
        attDisplay();
    }

    function escolherOperador(simbolo) {
        $('.display').removeClass('resultado-ajustado');

        if (novoNumero && expressaoX.length > 0) {
            if (typeof expressaoX[expressaoX.length - 1] === 'string') {
                expressaoX[expressaoX.length - 1] = simbolo;
                attDisplay();
                return;
            }
        }

        if (percentualPendente && !aplicarPercentual()) return;

        const num = parseFloat(valorAtual);
        if (isNaN(num)) return;

        if (percentualDigitado !== null) {
            rotulosPercentual[expressaoX.length] = percentualDigitado;
            percentualDigitado = null;
        }

        negativoFechado = false;
        expressaoX.push(num, simbolo);
        novoNumero = true;

        $('.historico').text(
            expressaoX.map((item, idx, valorX) => textoToken(item, idx, valorX)).join(' ')
        );
        attDisplay();
    }

    function igual() {
        if (expressaoX.length === 0) {
            if (!percentualPendente || !aplicarPercentual()) return;

            valorAtual = formatarResultado(parseFloat(valorAtual));

            const texto = formatoPercentual(percentualDigitado) + ' =';
            $('.historico').text(texto);
            registrarHistorico(texto, formatoDisplay(valorAtual, false));

            percentualDigitado = null;
            negativoFechado = false;
            novoNumero = true;

            $('.display').addClass('resultado-ajustado');
            mostrarNoDisplay(formatoDisplay(valorAtual, false));
            return;
        }
        calcular();
    }

    function limpar() {
        $('.display').removeClass('resultado-ajustado');

        valorAtual = '0';
        expressaoX = [];
        rotulosPercentual = {};
        percentualDigitado = null;
        percentualPendente = false;
        negativoFechado = false;
        novoNumero = false;
        attDisplay();
        $('.historico').text('');
    }

    function inverteSinal() {
        const aguardandoNumero = novoNumero && expressaoX.length > 0;

        if (aguardandoNumero || valorAtual === '0') return;

        $('.display').removeClass('resultado-ajustado');

        const temOperador = expressaoX.length > 0;
        const ultimoOperador = temOperador ? expressaoX[expressaoX.length - 1] : null;

        if (ultimoOperador === '-' && !valorAtual.startsWith('-')) {
            expressaoX[expressaoX.length - 1] = '+';
            negativoFechado = false;
        } else {
            const negativo = valorAtual.startsWith('-');
            valorAtual = negativo ? valorAtual.slice(1) : '-' + valorAtual;
            negativoFechado = !negativo;
        }

        if (temOperador) {
            $('.historico').text(
                expressaoX.map((item, idx, valorX) => textoToken(item, idx, valorX)).join(' ')
            );
        }

        attDisplay();
    }

    function porcentagem() {
        if (percentualPendente) return;

        if (novoNumero && expressaoX.length > 0) {
            const idxNumero = expressaoX.length - 2;
            if (rotulosPercentual[idxNumero] !== undefined) return;

            expressaoX.pop();
            valorAtual = String(expressaoX.pop());
            novoNumero = false;

            $('.historico').text(
                expressaoX.map((item, idx, valorX) => textoToken(item, idx, valorX)).join(' ')
            );
        }

        $('.display').removeClass('resultado-ajustado');
        percentualPendente = true;
        attDisplay();
    }

    function virgula() {
        $('.display').removeClass('resultado-ajustado');
        multiplicacaoImplicita();

        if (novoNumero) {
            valorAtual = '0.';
            novoNumero = false;
        } else if (valorAtual === '-' || valorAtual === '-0') {
            valorAtual = '-0.';
        } else if (!valorAtual.includes('.')) {
            valorAtual += '.';
        }
        attDisplay();
    }

    function processarTecla(texto) {
        if (texto !== '%' && texto !== '=' && !Object.hasOwn(operacoes, texto)) {
            percentualDigitado = null;
        }

        if (/^[0-9]$/.test(texto)) digitar(texto);
        else if (texto === ',') virgula();
        else if (Object.hasOwn(operacoes, texto)) escolherOperador(texto);
        else if (texto === '=') igual();
        else if (texto === limpartxt) limpar();
        else if (texto === apagartxt) apagar();
        else if (texto === '+/-') inverteSinal();
        else if (texto === '%') porcentagem();
    }

    $('.teclado button').on('click', function () {
        processarTecla($(this).text().trim());
    });
});