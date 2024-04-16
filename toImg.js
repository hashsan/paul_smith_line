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

