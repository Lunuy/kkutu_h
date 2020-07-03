

const Hangul = require('hangul-js');
function duum(char) {
    const disassembled = Hangul.disassemble(char);
    const za = disassembled[0];
    const mo = disassembled[1];
    return (
        disassembled.length < 2
        ?
            [char]
        :
            za === "ㄴ" && (mo === "ㅑ" || mo === "ㅕ" || mo === "ㅛ" || mo === "ㅠ" || mo === "ㅣ")
            ?
                [char, Hangul.assemble(["ㅇ", ...disassembled.slice(1)])]
            :
                za === "ㄹ"
                ?
                    (mo === "ㅑ" || mo === "ㅕ" || mo === "ㅛ" || mo === "ㅠ" || mo === "ㅣ")
                    ?
                        [char, Hangul.assemble(["ㅇ", ...disassembled.slice(1)])]
                    :
                        [char, Hangul.assemble(["ㄴ", ...disassembled.slice(1)])]
                :
            [char]
    );
}

module.exports = {
    duum
}