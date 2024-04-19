// 入力がURLかどうかを確認する関数
function isURL(input) {
    return typeof input === 'string' && (input.startsWith('http://') || input.startsWith('https://'));
}

// 入力がDataURLかどうかを確認する関数
function isDataURL(input) {
    return typeof input === 'string' && input.startsWith('data:');
}

// 入力がImageオブジェクトかどうかを確認する関数
function isImg(input) {
    return input instanceof HTMLImageElement;
}

// 入力がCanvas要素かどうかを確認する関数
function isCanvas(input) {
    return input instanceof HTMLCanvasElement;
}

/*
async function toImg(input) {
    var img = new Image();
    img.crossOrigin = 'anonymous';  // CORS問題を回避するために必要

    // Promiseを返す
    return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Image failed to load'));

        // 入力の種類をチェックして対応する
        if (isURL(input)) {
            img.src = input;
        } else if (isDataURL(input)) {
            img.src = input;
        } else if (input instanceof File) {
            var reader = new FileReader();
            reader.onload = function(e) {
                img.src = e.target.result;
            };
            reader.readAsDataURL(input);
        } else if (isCanvas(input)) {
            img.src = input.toDataURL();
        } else if (isImg(input)) {
            img.src = input.src;
            resolve(img);
        } else {
            reject(new Error('Unsupported input type'));
        }
    });
}

if(window) window.toImg=toImg; //////////////////

//old
*/
/////////////////////////////////////////////////

function parseWH(sizeStr) {
    let w = null;
    let h = null;

    if (sizeStr.includes('x')) {
        // 'x' が含まれている場合、幅と高さを分割して解析する
        const parts = sizeStr.split('x');
        if (parts[0] !== '') {
            w = parseInt(parts[0], 10); // 基数10を指定して整数として解析
        }
        if (parts[1] !== '') {
            h = parseInt(parts[1], 10); // 基数10を指定して整数として解析
        }
    } else {
        // 'x' が含まれていない場合、wまたはhを設定する
        const value = parseInt(sizeStr, 10); // 基数10を指定して整数として解析
        if (!isNaN(value)) {
            if (sizeStr.startsWith('x')) {
                h = value;
            } else {
                w = value;
            }
        }
    }

    return { w, h };
}


function resize(canvas, sizeStr) {
    // 新しいサイズを解析して幅と高さを取得
    const { w, h } = parseWH(sizeStr);

    // 元のキャンバスの幅と高さを取得
    const originalWidth = canvas.width;
    const originalHeight = canvas.height;

    // 新しい幅と高さを設定する
    let newWidth = w;
    let newHeight = h;

    // `w` または `h` が `null` の場合、元のキャンバスの比率に合わせて設定する
    if (newWidth === null) {
        // 幅が指定されていない場合、元のキャンバスの比率を保持して高さに基づいて幅を設定
        newWidth = (newHeight / originalHeight) * originalWidth;
    }
    if (newHeight === null) {
        // 高さが指定されていない場合、元のキャンバスの比率を保持して幅に基づいて高さを設定
        newHeight = (newWidth / originalWidth) * originalHeight;
    }

    // 新しいキャンバスを作成
    const newCanvas = document.createElement('canvas');
    newCanvas.width = newWidth;
    newCanvas.height = newHeight;

    // 元のキャンバスの内容を新しいキャンバスに描画
    const ctx = newCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, originalWidth, originalHeight, 0, 0, newWidth, newHeight);

    // 新しいサイズのキャンバスを返す
    return newCanvas;
}

async function toImg(input, sizeStr = null) {
    var img = new Image();
    img.crossOrigin = 'anonymous';  // CORS問題を回避するために必要

    // Promiseを返す
    return new Promise((resolve, reject) => {
        img.onload = async () => {
            // サイズ指定がある場合はリサイズ
            if (sizeStr !== null) {
                // `resize()` 関数を使用して画像をリサイズ
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const resizedCanvas = resize(canvas, sizeStr);
                const resizedImg = await toImg(resizedCanvas);
                resolve(resizedImg);
            } else {
                resolve(img);
            }
        };
        img.onerror = () => reject(new Error('Image failed to load'));

        // 入力の種類をチェックして対応する
        if (isURL(input)) {
            img.src = input;
        } else if (isDataURL(input)) {
            img.src = input;
        } else if (input instanceof File) {
            var reader = new FileReader();
            reader.onload = function(e) {
                img.src = e.target.result;
            };
            reader.readAsDataURL(input);
        } else if (isCanvas(input)) {
            img.src = input.toDataURL();
        } else if (isImg(input)) {
            img.src = input.src;
            resolve(img);
        } else {
            reject(new Error('Unsupported input type'));
        }
    });
}

/////////////////////////////////////////////////
function combine(img1, img2) {
    // キャンバス要素を作成
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    // 画像2の高さを画像1の高さに合わせる
    var scaleFactor = img1.height / img2.height;
    var newWidth = img2.width * scaleFactor;

    // キャンバスのサイズを設定
    canvas.width = img1.width + newWidth;
    canvas.height = img1.height;

    // 画像1をキャンバスに描画
    ctx.drawImage(img1, 0, 0);

    // 画像2をキャンバスに描画
    ctx.drawImage(img2, img1.width, 0, newWidth, img1.height);

    // キャンバス要素を返す
    return canvas;
}
/////////////////////////////////////////////////
// キャンバスを描画する関数
function drawPlettes(colorOrPalettes, canvasWidth, canvasHeight, n = null) {
    // キャンバス要素を作成
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth; // キャンバスの幅
    canvas.height = canvasHeight; // キャンバスの高さ
    
    // キャンバスの描画コンテキストを取得
    const ctx = canvas.getContext('2d');
    
    // 与えられた色が1色のみの場合、配列に変換してグリッドサイズを1に設定
    if (typeof colorOrPalettes === 'string') {
        colorOrPalettes = [colorOrPalettes];
        n = 1;
    }
    
    // セルのサイズを計算
    const cellWidth = canvasWidth / n;
    const cellHeight = canvasHeight / n;
    
    // グリッドを描画
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            // カラーコードを取得
            const color = colorOrPalettes[i * n + j];
            
            // セルの位置
            const x = j * cellWidth;
            const y = i * cellHeight;
            
            // セルを指定された色で塗りつぶす
            ctx.fillStyle = color;
            ctx.fillRect(x, y, cellWidth, cellHeight);
            
            // 文字色を背景色に基づいて設定
            const textColor = getTextColor(color);
            
            // セル内にカラーコードを表示
            ctx.fillStyle = textColor;
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(color, x + cellWidth / 2, y + cellHeight / 2);
        }
    }
    
    // 作成したキャンバス要素を返す
    return canvas;
}

// 色の明るさに基づいて文字色を決定するヘルパー関数
function getTextColor(color) {
    // 16進数カラーコードをRGB値に変換
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // 色の明るさを計算
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // 明るさが128以上なら黒、128未満なら白を返す
    return brightness >= 128 ? 'black' : 'white';
}
/*
// 使用例
const canvasWidth = 300; // キャンバスの幅
const canvasHeight = 300; // キャンバスの高さ

// 関数を呼び出して1つの色をキャンバス全体に描画し、結果を取得
const resultCanvas = drawPlettes('#fafafa', 300, canvasHeight);

// 上流で結果を使う
document.body.appendChild(resultCanvas);

// 複数の色を使って3x3のグリッドをキャンバスに描画し、結果を取得
const palettes = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#800000', '#008000', '#000080'
];
const gridCanvas = drawPlettes(palettes, canvasWidth, canvasHeight, 3);

// 上流で結果を使う
document.body.appendChild(gridCanvas);
*/

/////////////////////////////////////////////////
if(window){
    window.toImg=toImg;
    window.combine=combine;
    window.drawPlettes=drawPlettes;
}

/////////////////////////////////////////////////


