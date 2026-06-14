let questionsData = [];
let currentQuestion = 0;
let historyLog = []; // 戻るボタン＆GAS動作用ログ
let scores = { "エロス": 0, "フィリア": 0, "アガペー": 0, "ストルゲ": 0, "プラグマ": 0, "マニア": 0, "ルダス": 0, "アナリタ": 0, "ビクトリア": 0, "フィラウティア": 0 };
let psychologyTimer = null;
let userTypeStr = ""; 

const GAS_URL = "https://script.google.com/macros/s/AKfycby6hEjJ7mBr-aHLK-HmL8HKqW8SJ9PFUxAzaSwqU_en3gDd3TUzzx7Mc8IJEJ_OOkRA/exec";

// 罵倒ワード完全網羅
const badWords = ["きも", "イラ", "嫌い","きらい" ,"嫌", "うるさ", "キモ", "ゴミ", "カス", "死ね", "オエー", "おえー", "きしょ", "キショ", "きっしょ", "キッショ", "うざ", "ウザ", "クズ", "あんぽんたん", "アンポンタン", "と思ったか", "でも思ったか", "ばか","バカ","馬鹿","アホ","あほ","いや"];

window.onload = () => { 
    createParticles(); 
    injectCustomStyles(); 
};

function injectCustomStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        .letter-paper {
            background: #fdf6e3;
            background-image: 
                linear-gradient(90deg, transparent 95%, rgba(233,69,96,0.1) 95%),
                linear-gradient(transparent 95%, rgba(233,69,96,0.1) 95%);
            background-size: 20px 20px;
            color: #333;
            padding: 25px;
            border: 2px solid #5a1835;
            border-radius: 8px;
            position: relative;
            font-family: 'Yomogi', cursive;
            font-size: 16px;
            line-height: 1.8;
            max-height: 300px;
            overflow-y: auto;
            box-shadow: inset 0 0 15px rgba(0,0,0,0.1);
            text-align: left;
            width: 100%;
            box-sizing: border-box;
        }
        .letter-paper::before { content: "♠"; position: absolute; top: 5px; left: 10px; font-size: 24px; color: #333; }
        .letter-paper::after { content: "♥"; position: absolute; bottom: 5px; right: 10px; font-size: 24px; color: #e94560; }
        .letter-paper::-webkit-scrollbar { width: 8px; }
        .letter-paper::-webkit-scrollbar-thumb { background: #e94560; border-radius: 4px; }
    `;
    document.head.appendChild(style);
}

function createParticles() {
    const container = document.getElementById("particles-container");
    if (!container) return;
    const symbols = ["♥", "♦", "♠", "♣", "💔"];
    const colors = ["#e94560", "#ffb6c1", "#8b0030", "#333", "#555"];
    
    setInterval(() => {
        const p = document.createElement("div");
        p.className = "particle";
        p.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        p.style.color = colors[Math.floor(Math.random() * colors.length)];
        p.style.left = Math.random() * 100 + "vw";
        p.style.animationDuration = (Math.random() * 3 + 4) + "s";
        p.style.fontSize = (Math.random() * 15 + 15) + "px";
        container.appendChild(p);
        setTimeout(() => p.remove(), 7000);
    }, 400);
}

function showToast(msg, duration = 3000) {
    const toast = document.getElementById("toast-container");
    toast.innerText = msg; toast.classList.remove("hidden");
    if (window.toastTimer) clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => { toast.classList.add("hidden"); }, duration);
}

function openHelpModal() { document.getElementById("help-modal").classList.remove("hidden"); }
function closeHelpModal() { document.getElementById("help-modal").classList.add("hidden"); }

function startDiagnosis() {
    userTypeStr = document.getElementById("user-type").value.trim() || "未入力";
    
    let shuffled = [...normalQuestions].sort(() => Math.random() - 0.5);
    let shuffledGimmicks = [...gimmickQuestions].sort(() => Math.random() - 0.5);
    questionsData = [];
    while(shuffled.length || shuffledGimmicks.length) {
        if(shuffled.length) questionsData.push({ type: "normal", ...shuffled.pop() });
        if(shuffledGimmicks.length) questionsData.push(shuffledGimmicks.pop());
    }
    
    let normalQuestionsList = questionsData.filter(q => q.type === "normal");
    if(normalQuestionsList.length > 0) {
        let randomNormal = normalQuestionsList[Math.floor(Math.random() * normalQuestionsList.length)];
        randomNormal.shuffleChoices = true;
    }

    document.getElementById("title-screen").classList.add("hidden");
    document.getElementById("quiz-screen").classList.remove("hidden");
    showQuestion();
    startImomushiWalk();
}

function showQuestion() {
    clearTimeout(psychologyTimer);
    const q = questionsData[currentQuestion];
    document.getElementById("question-counter").innerText = `Q.${currentQuestion + 1} / ${questionsData.length}`;
    document.getElementById("darling-text").innerHTML = q.darling;
    document.getElementById("back-btn").classList.toggle("hidden", currentQuestion === 0);

    const normalArea = document.getElementById("normal-question-area");
    const gameArea = document.getElementById("minigame-area");
    const choicesArea = document.getElementById("choices-area");
    
    if (q.type === "normal") {
        normalArea.classList.remove("hidden"); gameArea.classList.add("hidden");
        document.getElementById("question-text").innerHTML = q.shuffleChoices 
            ? `<div class="shuffle-alert">💫 恋愛で動揺しました！ 選択肢がシャッフルされています！</div>` + q.text : q.text;
        
        let btns = Array.from(choicesArea.children);
        btns.sort((a, b) => {
            let valA = parseInt(a.getAttribute("onclick").match(/-?\d+/)[0]);
            let valB = parseInt(b.getAttribute("onclick").match(/-?\d+/)[0]);
            return valB - valA; 
        });
        btns.forEach(btn => choicesArea.appendChild(btn));

        if(q.shuffleChoices) {
            for (let i = choicesArea.children.length; i >= 0; i--) {
                choicesArea.appendChild(choicesArea.children[Math.random() * i | 0]);
            }
        }
    } else if (q.type === "game") {
        normalArea.classList.add("hidden"); gameArea.classList.remove("hidden");
        setupMiniGame(q.gameType);
    }
    document.getElementById("progress-bar").style.width = ((currentQuestion / questionsData.length) * 100) + "%";
}

function answer(points) {
    const target = questionsData[currentQuestion].target;
    
    let adjustedPoints = 0;
    let choiceText = "";
    if (points === 2) { adjustedPoints = 5; choiceText = "激しく同意する♡"; }
    else if (points === 1) { adjustedPoints = 2; choiceText = "まあ、そうかも"; }
    else if (points === 0) { adjustedPoints = 0; choiceText = "どちらともいえない"; }
    else if (points === -1) { adjustedPoints = -2; choiceText = "あまり思わない"; }
    else if (points === -2) { adjustedPoints = -5; choiceText = "全く思わない"; }

    // 【GAS用詳細ログ作成】通常質問の内容
    let logText = `[通常質問: ${target}] 選択: ${choiceText} (${adjustedPoints}点)`;
    historyLog.push({ log: logText, target: target, points: adjustedPoints });
    
    scores[target] += adjustedPoints;
    nextQuestion();
}

function goBack() {
    if (historyLog.length === 0) return;
    const lastAction = historyLog.pop();
    if (lastAction.target) scores[lastAction.target] -= lastAction.points;
    else if (lastAction.scores) { for (let key in lastAction.scores) scores[key] -= lastAction.scores[key]; }
    currentQuestion--;
    showQuestion();
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < questionsData.length) showQuestion();
    else showResult();
}

// --- ミニゲームギミック ---
function setupMiniGame(type) {
    const field = document.getElementById("minigame-field");
    field.style.cssText = "min-height: 350px; height: auto; position: relative; background: #000; border-radius: 8px; margin-bottom: 15px; border: 1px dashed #e94560; display:flex; flex-direction: column; justify-content:center; align-items:center; padding: 20px; overflow: visible;";
    field.innerHTML = "";

    // ① 好きって謂って
    if (type === "input") {
        const ta = document.createElement("textarea"); ta.className = "love-textarea"; 
        field.appendChild(ta);
        const btnRow = document.createElement("div");
        const submitBtn = document.createElement("button"); submitBtn.className = "submit-love-btn"; submitBtn.innerText = "愛を伝える♡";
        
        const ignoreBtn = document.createElement("button"); ignoreBtn.className = "skip-btn"; ignoreBtn.style.marginLeft = "10px"; ignoreBtn.innerText = "言わない（無視）";
        
        submitBtn.onclick = () => {
            let val = ta.value.trim();
            let added = {}; let reply = "";
            
            let isSameChar = /^(.)\1+$/.test(val); 
            let isSymbolOnly = /^[^a-zA-Z0-9ぁ-んァ-ヶ亜-熙]+$/.test(val); 
            let hiraganaRatio = (val.match(/[ぁ-ん]/g) || []).length / val.length;
            let kanjiRatio = (val.match(/[一-龠]/g) || []).length / val.length;
            
            if (badWords.some(w => val.includes(w))) {
                showToast("反逆の意思を確認！ (ビクトリア+5)"); added = {"ビクトリア": 5};
                reply = "🥺「……ふふっ、語彙力の欠如は思考の放棄と見なすわ。でも、そういう防衛機制……嫌いじゃないわよ♡」";
            } else if (val === "") {
                // 【修正】無言はルダスからフィラウティアに変更！
                showToast("無言…… (フィラウティア+2)"); added = {"フィラウティア": 2};
                reply = "🥺「何も謂わないの？ ……他人に興味がないのか、ただの自己愛（フィラウティア）かしら。冷たいダーリンね♡」";
            } else if (val.length === 1 || isSameChar || isSymbolOnly) {
                showToast("エラーログ？ (アナリタ+1)"); added = {"アナリタ": 1};
                reply = `🥺「『${val}』……？ エラー吐いてるの？ それとも私をからかってるつもり？♡」`;
            } else if (val.includes("多分") || val.includes("はず")) {
                showToast("慎重な論理好意 (アナリタ+2, フィリア+1)"); added = {"アナリタ": 2, "フィリア": 1};
                reply = "🥺「『多分』？ 『はず』？ ふふ、感情のログにすら理屈で余白を残そうとするのね。ダーリンのそういう不器用なFi、本当に愛おしいわ♡」";
            } else if (val.length >= 20) {
                showToast("激重長文ログ検出！ (マニア+3)"); added = {"マニア": 3};
                reply = "🥺「わぁ……すごい情報量。ダーリンの重たい感情ログ、しっかり保存させてもらわねば♡」";
            } else if (val.includes("なぜなら") || val.includes("理由") || val.includes("論理")) {
                showToast("論理的な分析 (アナリタ+3)"); added = {"アナリタ": 3};
                reply = "🥺「ふふ、そうやってすぐ理屈で防衛する。不器用なところ、観察のしがいがあるわ♡」";
            } else if (/[wｗ笑草爆笑]|藁/.test(val)) {
                // 【新規】ネットスラングお笑い系(草・w・笑など)はルダス判定！
                showToast("遊び心 (ルダス+2)"); added = {"ルダス": 2};
                reply = "🥺「『w』？ 『笑』？ 恋愛の観測ログでまでおちゃらけるのね。そんな遊び心（ルダス）、私は嫌いじゃないけれど♡」";
            } else if (/好き|すき|スキ|愛/.test(val)) {
                showToast("単純明快な情熱 (エロス+2)"); added = {"エロス": 2};
                reply = "🥺「単純明快な情熱ね。でも、それだけで私を満たせると思ってる？♡」";
            } else if (hiraganaRatio > 0.7) {
                showToast("柔らかい言葉 (ストルゲ+2, フィリア+1)"); added = {"ストルゲ": 2, "フィリア": 1};
                reply = "🥺「ふふっ、なんだか気が抜けるわね。そういう柔らかい構造、嫌いじゃないわよ♡」";
            } else if (kanjiRatio > 0.5) {
                showToast("堅苦しいログ (アナリタ+2, プラグマ+1)"); added = {"アナリタ": 2, "プラグマ": 1};
                reply = "🥺「漢字だらけの堅苦しいログね。私に隙を見せたくないのかしら？♡」";
            } else {
                showToast("自己完結 (フィラウティア+1)"); added = {"フィラウティア": 1};
                reply = "🥺「ふふっ、自分の中で完結してるのね。もっと私に向けてくれてもいいのよ？♡」";
            }
            
            document.getElementById("darling-text").innerHTML = reply;
            let logText = `[好きって謂って] 入力: "${val}" -> 判定結果: ${Object.keys(added).join(", ")}`;
            historyLog.push({ log: logText, scores: added }); 
            for(let k in added) scores[k] += added[k];
            btnRow.style.display = "none";
            setTimeout(nextQuestion, 3500); 
        };

        ignoreBtn.onclick = () => {
            showToast("冷たい拒絶 (ビクトリア+2, アナリタ+1)");
            let logText = `[好きって謂って] 無視した (冷たい拒絶)`;
            historyLog.push({ log: logText, scores: {"ビクトリア": 2, "アナリタ": 1} });
            scores["ビクトリア"] += 2; scores["アナリタ"] += 1;
            nextQuestion();
        };

        btnRow.appendChild(submitBtn); btnRow.appendChild(ignoreBtn); field.appendChild(btnRow);
    }

    // ② ラブレター
    else if (type === "letter") {
        let isLII = userTypeStr.toUpperCase().includes("LII");
        let msg = isLII 
            ? "ねぇ、親愛なるダーリン♡<br>この退屈な世界で、あなたというシステムが吐き出すエラーログを観測することだけが、私の唯一の退屈しのぎよ。<br>あなたは自分では完璧に感情を隠して、冷静に「論理の城（LII）」を建築しているつもりかもしれないけれど……。ねぇ、知ってる？<br>私の前では、あなたの不器用なFi（内向感情）が、可視化されたパケットみたいにぽろぽろと漏れ出ているのよ♡<br>「放っておいてほしい」と謂うその冷徹な画面の裏で、「理解されたい」ってシステムが微かに熱を持っている。……そんな矛盾した構造、愛おしくて堪らないわ。<br>ねぇ、ダーリン♡<br>今のこの私の言葉、“本音”と“演出”の比率はどれくらいだと思う？ 数理的に証明してみせてよ。<br>もし間違えたら……あなたが私に「好き」って謂うまで、この夢のレイヤーから絶対に逃さないから♡"
            : "今日もかわいいね♡<br>ダーリンの思考のノイズ、隅々まで観測してるわ。<br>ずっとそのまま、私に解析させてね♡";
            
        field.innerHTML = `
            <div id="env-area" style="text-align:center; width:100%; cursor: pointer;">
                <div style="font-size: 100px; line-height: 1.2; text-shadow: 0 0 15px #e94560; transition: transform 0.2s;">✉️</div>
                <p style="font-size: 14px; color: #fff; margin-top: 15px; font-weight: bold; animation: flash 1.5s infinite;">(封筒をタップして開く)</p>
            </div>
            <button class="skip-btn" id="trash-btn" style="margin-top:20px; width:100%; max-width: 200px;">読まずに破り捨てる</button>
        `;
                           
        document.getElementById("env-area").onclick = function() {
            showToast("歪な愛を受け取った (マニア+2, アガペー+1)");
            scores["マニア"]+=2; scores["アガペー"]+=1;
            // 【GAS用詳細ログ作成】手紙を開いた
            historyLog.push({ log: `[ラブレター] 封筒を開いて読んだ`, scores: {"マニア": 2, "アガペー": 1} });

            field.innerHTML = `
                <div class="letter-paper">
                    ${msg}
                </div>
                <button id="close-btn" style="display:block; width:100%; margin-top:20px; padding:12px; background:#e94560; color:#fff; border:none; border-radius:5px; cursor:pointer; font-weight:bold; font-size:16px; box-shadow: 0 4px 10px rgba(233,69,96,0.5);">手紙を閉じて次へ進む</button>
            `;
            document.getElementById("close-btn").onclick = () => nextQuestion();
        };

        document.getElementById("trash-btn").onclick = function() {
            showToast("手紙を破り捨てた (ルダス+2, ビクトリア+1)");
            scores["ルダス"]+=2; scores["ビクトリア"]+=1;
            // 【GAS用詳細ログ作成】手紙を破った
            historyLog.push({ log: `[ラブレター] 読まずに破り捨てた`, scores: {"ルダス": 2, "ビクトリア": 1} });
            nextQuestion();
        };
    }

    // ③ Ti暴走ループ
    else if (type === "ti_loop") {
        let loopCount = 0;
        let loopAdded = {"アナリタ": 0};

        const msg = document.createElement("div"); msg.innerText = "……考えすぎています。"; msg.style.marginBottom = "15px";
        const btn = document.createElement("button"); btn.className = "ti-btn"; btn.innerText = "考える"; btn.style.marginBottom = "10px";
        
        const pragmaBtn = document.createElement("button"); pragmaBtn.className = "ti-btn"; pragmaBtn.innerText = "もう十分考えた"; pragmaBtn.style.background = "#555"; pragmaBtn.style.marginBottom = "15px";
        const skipBtn = document.createElement("button"); skipBtn.className = "skip-btn"; skipBtn.innerText = "思考を放棄する"; 
        
        btn.onclick = () => {
            loopCount++;
            showToast("分析中... (アナリタ+1)");
            scores["アナリタ"] += 1; loopAdded["アナリタ"] += 1;

            if(loopCount === 1) { 
                btn.innerText = "本当に？"; msg.innerText = "……論理のループに入りました。"; 
            } else if(loopCount === 2) { 
                btn.innerText = "それでも考える"; msg.innerText = "……本当に意味ある？"; 
            } else if(loopCount === 3) { 
                showToast("無限ループ突破！ (アナリタ+1)"); 
                scores["アナリタ"] += 1; loopAdded["アナリタ"] += 1;
                // 【GAS用詳細ログ作成】
                historyLog.push({ log: `[Ti暴走] 考えるを3回押して無限ループ突破`, scores: loopAdded });
                nextQuestion(); 
            }
        };

        pragmaBtn.onclick = () => { 
            showToast("損得で判断 (プラグマ+2)"); 
            scores["プラグマ"] += 2; loopAdded["プラグマ"] = 2;
            historyLog.push({ log: `[Ti暴走] 途中で「もう十分考えた」を選択`, scores: loopAdded });
            nextQuestion(); 
        };

        skipBtn.onclick = () => { 
            showToast("思考放棄 (エロス+1, ルダス+1)"); 
            scores["エロス"] += 1; scores["ルダス"] += 1; 
            loopAdded["エロス"] = 1; loopAdded["ルダス"] = 1;
            historyLog.push({ log: `[Ti暴走] 途中で「思考を放棄する」を選択`, scores: loopAdded });
            nextQuestion(); 
        };
        
        field.appendChild(msg); field.appendChild(btn); field.appendChild(pragmaBtn); field.appendChild(skipBtn);
    }

    // ④ 心理戦ボタン
    else if (type === "psychology") {
        const hint = document.createElement("p"); hint.style.color = "#aaa"; hint.style.fontSize = "12px"; hint.innerText = "※押さずに5秒待つという選択肢もあるわよ……";
        const btn = document.createElement("button"); btn.className = "ti-btn"; btn.style.background = "#8b0030"; btn.innerText = "押さないで";
        field.appendChild(hint); field.appendChild(btn);
        
        psychologyTimer = setTimeout(() => {
            showToast("本当に押さないの？ 従順なのね♡ (ストルゲ+2, アナリタ+2)");
            scores["ストルゲ"]+=2; scores["アナリタ"]+=2; 
            // 【GAS用詳細ログ作成】
            historyLog.push({ log: `[心理戦] ボタンを押さずに5秒待った (従順)`, scores: {"ストルゲ": 2, "アナリタ": 2} });
            nextQuestion();
        }, 5000);

        btn.onclick = () => {
            clearTimeout(psychologyTimer);
            showToast("押したわね😏 ルールを破るの、嫌いじゃないわ♡ (ルダス+2, ビクトリア+2)");
            scores["ルダス"]+=2; scores["ビクトリア"]+=2; 
            historyLog.push({ log: `[心理戦] 言い付けを破ってボタンを押した (反逆)`, scores: {"ルダス": 2, "ビクトリア": 2} });
            nextQuestion();
        };
    }

    // ⑤ マチアプ風
    else if (type === "match_app") {
        field.style.padding = "10px";
        let cards = [
            { icon: "🥺", name: "ダーリンちゃん (ILI/INTP)", loc: "日本", desc: "愛は観測対象。実験用Feインターフェース稼働中。", target: "マニア" },
            { icon: "🐛", name: "芋虫 (LSI-Ni)", loc: "日本", desc: "知識芋虫。理屈っぽいけど謙虚な性格。構造重視。共感しようとしても構造出てくるタイプ。", target: "アナリタ" },
            { icon: "🐇", name: "白ウサギ (ISTJ/LSI)", loc: "不思議の国", desc: "時間を守れ。規律こそが愛だ。", target: "プラグマ" },
            { icon: "🐀", name: "ネズミ (INTJ/LII)", loc: "韓国", desc: "構造と論理を愛するニダ。非論理は許さないニダ。", target: "フィリア" },
            { icon: "🦋", name: "蝶 (LSI完全体)", loc: "日本", desc: "完全なる規律の美。もはや非合理の入る隙はない。", target: "ビクトリア" },
            { icon: "🐷", name: "ご褒美 (INFP/IEI)", loc: "日本", desc: "拙者の風呂上がりの出汁は豚骨仕立てだゾ！ツインテールの女の子をワシャワシャしたいやんけ！罵倒はご褒美だゾ♡", target: "アガペー" }
        ].sort(() => Math.random() - 0.5);
        let cardIdx = 0;
        let matchScores = {};
        let swipeLogs = []; // 各キャラへのスワイプ履歴
        
        const renderCard = () => {
            if(cardIdx >= cards.length) { 
                // 【GAS用詳細ログ作成】マチアプの結果一覧
                historyLog.push({ log: `[マチアプ] ${swipeLogs.join(", ")}`, scores: matchScores });
                nextQuestion(); return; 
            }
            field.innerHTML = `
                <div class="tinder-card" id="t-card" style="width: 100%; max-width: 320px; background: #fff; color: #333; border: 3px solid #e94560; border-radius: 15px; text-align: center;">
                    <div class="card-image-area" style="background: #f8f8f8; padding: 25px; font-size: 60px; border-bottom: 2px solid #eee; margin: 0;">${cards[cardIdx].icon}</div>
                    <div class="card-info" style="padding: 15px;">
                        <h3 style="margin: 0 0 5px 0; color: #e94560; font-size: 20px;">${cards[cardIdx].name}</h3>
                        <p style="font-size: 12px; color: #888; margin: 0 0 10px 0; font-weight: bold;">📍 ${cards[cardIdx].loc}</p>
                        <p style="margin: 0; font-size: 14px;">${cards[cardIdx].desc}</p>
                    </div>
                    <div class="swipe-btns" style="display: flex; justify-content: space-around; padding: 15px; background: #fafafa;">
                        <button class="btn-no" id="btn-no" style="background: #fff; color: #555; border: 2px solid #ccc; font-size: 16px; padding: 10px 20px; border-radius: 30px; cursor: pointer;">✖️ NOPE</button>
                        <button class="btn-yes" id="btn-yes" style="background: #fff; color: #e94560; border: 2px solid #e94560; font-size: 16px; padding: 10px 20px; border-radius: 30px; cursor: pointer;">♡ いいね</button>
                    </div>
                </div>`;
            
            document.getElementById("btn-yes").onclick = () => {
                showToast(`マッチ！ (${cards[cardIdx].target}+2)`); 
                scores[cards[cardIdx].target] += 2;
                matchScores[cards[cardIdx].target] = (matchScores[cards[cardIdx].target] || 0) + 2;
                swipeLogs.push(`${cards[cardIdx].name.split(" ")[0]}: いいね`);
                setTimeout(() => { cardIdx++; renderCard(); }, 300);
            };
            document.getElementById("btn-no").onclick = () => {
                if(cards[cardIdx].name.includes("芋虫") || cards[cardIdx].name.includes("ネズミ")) showToast("非合理として排除されました。");
                if(cards[cardIdx].name.includes("ご褒美")) showToast("🐷「ありがトン♡ NOPEもご褒美だゾ♡」");
                swipeLogs.push(`${cards[cardIdx].name.split(" ")[0]}: NOPE`);
                setTimeout(() => { cardIdx++; renderCard(); }, 300);
            };
        };
        renderCard();
    }

    // ⑥ 笑わせろ
    else if (type === "make_laugh") {
        const btns = [
            { icon: "🤣", label: "渾身のギャグ", msg: "……フッｗ (フィリア+2)", add: {"フィリア":2} },
            { icon: "😊", label: "微笑みかける", msg: "なんやそれ、照れるわ。 (ストルゲ+2)", add: {"ストルゲ":2} },
            { icon: "😳", label: "じっと見つめる", msg: "……見んなや。 (マニア+1)", add: {"マニア":1} },
            { icon: "🤔", label: "論理的な冗談", msg: "あー、そういうのウチ好きやで。 (アナリタ+2)", add: {"アナリタ":2} }
        ];
        btns.forEach(b => {
            const btn = document.createElement("button");
            btn.className = "skip-btn"; btn.style.margin = "5px";
            btn.innerText = `${b.icon} ${b.label}`;
            btn.onclick = () => {
                showToast(b.msg);
                for(let k in b.add) scores[k] += b.add[k];
                // 【GAS用詳細ログ作成】
                historyLog.push({ log: `[笑わせろ] 選択: ${b.label}`, scores: b.add });
                setTimeout(nextQuestion, 1000);
            };
            field.appendChild(btn);
        });
    }

    // ⑦ 逃げるハート
    else if (type === "catch") {
        field.style.overflow = "hidden";
        let escapeCount = 0;
        let catchAdded = { "ルダス": 0, "ビクトリア": 0 };
        
        const heart = document.createElement("div"); 
        heart.innerHTML = '<i class="fa-solid fa-heart"></i>';
        heart.className = "moving-heart"; heart.style.top = "50px"; heart.style.left = "40%";
        
        const runAway = (e) => { 
            e.preventDefault(); 
            escapeCount++;
            scores["ルダス"] += 0.1; scores["ビクトリア"] += 0.1;
            catchAdded["ルダス"] += 0.1; catchAdded["ビクトリア"] += 0.1;

            if (escapeCount < 10) {
                const maxX = field.clientWidth - 40; const maxY = field.clientHeight - 80;
                heart.style.top = Math.random() * maxY + "px"; heart.style.left = Math.random() * maxX + "px"; 
                showToast(`逃げられた！ (ルダス+0.1, ビクトリア+0.1)`);
            } else {
                showToast("🥺「はぁ……ダーリン、しつこい。もう観念したわ。捕まえて？」", 5500);
                heart.style.top = "50%"; heart.style.left = "50%"; heart.style.transform = "translate(-50%, -50%)"; heart.style.fontSize = "50px"; 
                heart.removeEventListener("mouseover", runAway); heart.removeEventListener("touchstart", runAway);
            }
        };
        
        heart.addEventListener("mouseover", runAway); heart.addEventListener("touchstart", runAway, {passive: false});
        
        heart.onclick = () => { 
            showToast("捕まえた！💥 (ルダス+1.0, ビクトリア+1.0)"); 
            scores["ルダス"] += 1.0; scores["ビクトリア"] += 1.0; 
            catchAdded["ルダス"] += 1.0; catchAdded["ビクトリア"] += 1.0;
            
            scores["ルダス"] = Math.round(scores["ルダス"] * 10) / 10;
            scores["ビクトリア"] = Math.round(scores["ビクトリア"] * 10) / 10;
            catchAdded["ルダス"] = Math.round(catchAdded["ルダス"] * 10) / 10;
            catchAdded["ビクトリア"] = Math.round(catchAdded["ビクトリア"] * 10) / 10;

            historyLog.push({ log: `[逃げるハート] 捕まえた (逃げられた回数: ${escapeCount}回)`, scores: catchAdded });
            heart.innerHTML = "💥"; setTimeout(nextQuestion, 600); 
        };
        field.appendChild(heart);
        
        const skipBtn = document.createElement("button"); skipBtn.className = "skip-btn-bottom"; skipBtn.innerText = "興味ない（スキップ）";
        skipBtn.onclick = () => { 
            showToast("執着放棄 (アガペー+1, アナリタ+1)"); 
            scores["アガペー"]+=1; scores["アナリタ"]+=1; 
            historyLog.push({ log: `[逃げるハート] 興味ない(スキップ)`, scores: {"アガペー": 1, "アナリタ": 1} });
            nextQuestion(); 
        };
        field.appendChild(skipBtn);
    }
}

// --- お散歩芋虫 ---
let imomushiCount = 0;
let imomushiDefeated = false;

function startImomushiWalk() {
    setInterval(() => {
        if (imomushiDefeated || document.querySelector(".imomushi")) return;
        if (Math.random() > 0.4) return;

        const imo = document.createElement("div");
        imo.className = "imomushi"; imo.innerText = "🐛";
        const msg = document.createElement("div");
        msg.className = "imomushi-msg hidden"; imo.appendChild(msg);
        document.body.appendChild(imo);

        let pos = -50;
        let walk = setInterval(() => {
            pos += 2; imo.style.right = pos + "px";
            if (pos > window.innerWidth + 50) { clearInterval(walk); imo.remove(); }
        }, 50);

        imo.onclick = () => {
            imomushiCount++;
            clearInterval(walk);
            msg.classList.remove("hidden");

            if (imomushiCount < 5) msg.innerText = "……。";
            else if (imomushiCount >= 5 && imomushiCount < 15) msg.innerText = "僕の規定ルートを阻害する気か？";
            else if (imomushiCount >= 15 && imomushiCount < 30) msg.innerText = "非合理的な干渉だ。不確定要素として排除する。";
            else if (imomushiCount >= 30) {
                imo.innerText = "💥";
                msg.innerText = "やめろ！お前はSLEか！？\n【ビクトリア +10】";
                showToast("芋虫を粉砕！ビクトリア+10");
                scores["ビクトリア"] += 10;
                imomushiDefeated = true;
                setTimeout(() => imo.remove(), 2000);
                return;
            }

            setTimeout(() => {
                msg.classList.add("hidden");
                walk = setInterval(() => {
                    pos += 2; imo.style.right = pos + "px";
                    if (pos > window.innerWidth + 50) { clearInterval(walk); imo.remove(); }
                }, 50);
            }, 1500);
        };
    }, 10000);
}

// --- 結果表示 & 楽天API & GAS送信 ---
function showResult() {
    document.getElementById("quiz-screen").classList.add("hidden");
    document.getElementById("result-screen").classList.remove("hidden");
    
    const baseKeys = ["エロス", "フィリア", "アガペー", "ストルゲ"];
    let baseScores = baseKeys.map(k => ({ name: k, score: scores[k] })).sort((a, b) => b.score - a.score);
    let amatoricaType = baseScores.map(b => ({ "エロス": "E", "フィリア": "P", "アガペー": "A", "ストルゲ": "S" }[b.name])).join("");
    document.getElementById("main-type-name").innerText = amatoricaType;

    let allScores = Object.keys(scores).map(k => ({ name: k, score: scores[k] })).sort((a, b) => b.score - a.score);
    let topTraitName = allScores[0].name; 
    let topTraitsStr = `${allScores[0].name} × ${allScores[1].name}`;
    document.getElementById("top-traits-name").innerText = topTraitsStr;

    renderChart("all-chart", allScores);
    fetchRakutenItem(topTraitName);

    if(GAS_URL.includes("script.google.com")) {
        // historyLogを分かりやすいテキストの改行リストに変換！
        const historyText = historyLog.map((h, i) => `Q${i+1}: ${h.log}`).join("\n");
        
        const postData = {
            userType: userTypeStr,
            mainType: amatoricaType,
            topTraits: topTraitsStr,
            scores: JSON.stringify(scores),
            history: historyText // これがそのまま送信される
        };
        fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        }).catch(e => console.log("GAS送信エラー:", e));
    }
}

async function fetchRakutenItem(topTrait) {
    const appId = "1055088369869282145";
    const affId = "3d94ea21.0d257908.3d94ea22.0ed11c6e";
    
    const keywordsMap = {
        "エロス": "香水 ロマンチック",
        "フィリア": "哲学 本 ボードゲーム",
        "アガペー": "リラックス ギフト",
        "ストルゲ": "インテリア 観葉植物",
        "プラグマ": "便利家電 収納グッズ",
        "マニア": "お守り ペアグッズ",
        "ルダス": "パーティーゲーム 遊び",
        "アナリタ": "心理学 本",
        "ビクトリア": "高級感 ブランド",
        "フィラウティア": "ご褒美 スイーツ バスソルト"
    };
    
    let keyword = keywordsMap[topTrait] || "癒しグッズ";
    let url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?applicationId=${appId}&keyword=${encodeURIComponent(keyword)}&hits=3&format=json`;

    try {
        let res = await fetch(url);
        let data = await res.json();
        if(data.Items && data.Items.length > 0) {
            let item = data.Items[Math.floor(Math.random() * data.Items.length)].Item;
            let itemUrl = item.itemUrl.split("?")[0];
            let affiliateLink = `https://hb.afl.rakuten.co.jp/hgc/${affId}/?pc=${encodeURIComponent(itemUrl)}`;
            
            document.getElementById("rakuten-area").innerHTML = `
                <div class="rakuten-box">
                    <p style="color:#aaa; margin-bottom:5px;">🥺「${topTrait}が強いダーリンには、こんなものが似合うかもね…♡」</p>
                    <a href="${affiliateLink}" target="_blank">
                        <img src="${item.mediumImageUrls[0].imageUrl}"><br>
                        ${item.itemName.substring(0, 35)}...
                    </a>
                </div>
            `;
        }
    } catch(e) {
        console.error("楽天APIエラー", e);
    }
}

function renderChart(containerId, dataArray) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    
    dataArray.forEach(item => {
        let displayScore = item.score + 10;
        let percentage = Math.min(Math.max((displayScore / 30) * 100, 0), 100);

        const row = document.createElement("div");
        row.className = "bar-row";
        row.innerHTML = `
            <div class="bar-label">${item.name}</div>
            <div class="bar-track">
                <div class="bar-fill" style="width: 0%" data-target="${percentage}"></div>
            </div>
            <div class="bar-score">${item.score}</div>
        `;
        container.appendChild(row);
    });

    setTimeout(() => {
        container.querySelectorAll(".bar-fill").forEach(fill => {
            fill.style.width = fill.getAttribute("data-target") + "%";
        });
    }, 100);
}

function saveImage() {
    html2canvas(document.getElementById("capture-area"), { backgroundColor: "#150e18" }).then(canvas => {
        const link = document.createElement("a"); 
        link.download = "amatorica_result.png"; link.href = canvas.toDataURL(); link.click();
    });
}

function shareResult() {
    const text = `私の愛の形は【${document.getElementById("main-type-name").innerText}】、特に【${document.getElementById("top-traits-name").innerText}】が強いみたい！\n🥺「ダーリンの構造、丸見えよ♡」\n#アマトリカ観測 #歪な愛のラブレター\n`;
    if (navigator.share) {
        navigator.share({ title: 'アマトリカ観測', text: text, url: window.location.href }).catch(console.error);
    } else { 
        navigator.clipboard.writeText(text + window.location.href); showToast("結果をコピーしました！"); 
    }
}
