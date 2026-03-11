const extractVideoId = (input) => {
	const idPattern = /^[a-zA-Z0-9_-]{11}$/;
	if (!input) return null;
	if (idPattern.test(input)) return input;
	try {
		let str = String(input).trim();
		const defaultProtocol = (typeof location !== 'undefined' && location.protocol && location.protocol !== 'about:') ? location.protocol : 'https:';
		if (str.startsWith('//')) str = defaultProtocol + str;
		if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(str)) str = 'https://' + str;
		const url = new URL(str);
		let host = url.hostname.toLowerCase();
		if (host.startsWith('www.')) host = host.slice(4);
		if (host === 'youtu.be') {
			const p = url.pathname.split('/').filter(Boolean);
			if (p[0] && idPattern.test(p[0])) return p[0];
		}
		if (host.endsWith('youtube.com') || host.endsWith('yout-ube.com') || host.endsWith('youtube-nocookie.com')) {
			const v = url.searchParams.get('v');
			if (v && idPattern.test(v)) return v;
			const pathParts = url.pathname.split('/').filter(Boolean);
			for (let i = 0; i < pathParts.length; i++) {
				if ((pathParts[i] === 'embed' || pathParts[i] === 'v' || pathParts[i] === 'shorts') && pathParts[i + 1] && idPattern.test(pathParts[i + 1])) return pathParts[i + 1];
			}
			for (const seg of pathParts) {
				if (idPattern.test(seg)) return seg;
			}
		}
	} catch {}
	const m = String(input).match(/[a-zA-Z0-9_-]{11}/);
	return m ? m[0] : null;
};

const openSearch = (keyword) => {
	if (keyword) {
		window.open(`https://www.google.com/search?q=${encodeURIComponent(keyword)}+site:youtube.com/watch`, "_blank");
	} else {
		alert("検索キーワードを入力してください。");
	}
};

const loadPlayer = () => {
	const inputValue = document.getElementById('videoId').value.trim();
	const videoId = extractVideoId(inputValue);
	if (videoId) {
		const newWin = window.open("about:blank", "_blank");
		if (newWin) {
			newWin.document.write(`
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <style>
          :root {--primary:#ff5555;--primary-hover:#e64545;--bg:#fff;--text:#333;--input-bg:#f9f9f9;--input-border:#ccc;--radius:8px;--transition:0.3s ease;}
          html,body{margin:0;padding:0;height:100%;background:var(--bg);color:var(--text);font-family:system-ui,sans-serif;overflow:hidden;}
          #app{display:flex;flex-direction:column;height:100vh;overflow:hidden;}
          #topBar{display:flex;align-items:center;gap:.5rem;padding:.5rem;box-sizing:border-box;background:#f5f5f5;border-bottom:1px solid #ddd;width:100%;flex-shrink:0;min-height:48px;flex-wrap:wrap;}
          #videoInput,#searchInput{flex:1;padding:.5em 1em;font-size:1rem;border:2px solid var(--input-border);border-radius:var(--radius);background:var(--input-bg);color:var(--text);outline:none;transition:border-color var(--transition),box-shadow var(--transition);}
          #videoInput:focus,#searchInput:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(255,85,85,.2);}
          #playBtn,#searchBtn{padding:.5em 1em;font-size:1rem;border:none;border-radius:var(--radius);background:var(--primary);color:#fff;cursor:pointer;transition:background-color var(--transition),transform var(--transition);}
          #playBtn:hover,#searchBtn:hover{background:var(--primary-hover);transform:translateY(-2px);}
          #playerFrame{flex:1 1 auto;width:100%;border:none;min-height:0;}
          @media(max-width:900px){#videoInput,#searchInput,#playBtn,#searchBtn{font-size:.95rem;}}
          @media(max-width:600px){#topBar{flex-direction:column;align-items:stretch;gap:.75rem;padding:.5rem;}#videoInput{width:100%;font-size:1rem;padding:.75em 1em;box-sizing:border-box;}#playBtn{width:100%;font-size:1rem;padding:.75em 0;}#searchInput,#searchBtn{display:none;}}
    <\/style>
<\/head>
<body>
    <div id="app">
        <div id="topBar">
            <input id="videoInput" placeholder="YouTubeの動画ID または URL" type="text" value="${videoId}"> <button id="playBtn">再生<\/button> <input id="searchInput" placeholder="検索キーワード" type="text"> <button id="searchBtn">検索<\/button>
        <\/div>
    <iframe id="playerFrame" src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
    <\/div>
    <script>
		    const frame = document.getElementById('playerFrame');
			frame.setAttribute("tabindex", "0");
			frame.addEventListener('load', () => {
			  frame.focus();
			});
            const extractVideoId = (input) => {
            const idPattern = /^[a-zA-Z0-9_-]{11}$/;
            if (idPattern.test(input)) return input;
            try {
              const url = new URL(input);
              if (url.hostname.includes('youtube.com')) {
                if (url.searchParams.get('v')) return url.searchParams.get('v');
                if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2];
              }
              if (url.hostname.includes('youtu.be')) return url.pathname.slice(1);
            } catch {}
            return null;
          };
          const openSearch = ${openSearch.toString()};
          const play = () => {
            const val = document.getElementById('videoInput').value.trim();
            const vid = extractVideoId(val);
            if (vid) {
              document.getElementById('playerFrame').src =
                "https://www.youtube-nocookie.com/embed/" + vid + "?autoplay=1";
            } else {
              openSearch(val);
            }
          };
          const search = () => {
            openSearch(document.getElementById('searchInput').value.trim());
          };
          document.getElementById('playBtn').addEventListener('click', play);
          document.getElementById('searchBtn').addEventListener('click', search);
          const bindEnter = (id, handler) => {
            document.getElementById(id).addEventListener('keydown', e => {
              if (e.key === 'Enter') handler();
            });
          };
          bindEnter('videoInput', play);
          bindEnter('searchInput', search);
          ['videoInput','searchInput'].forEach(id => {
            const el = document.getElementById(id);
            el.addEventListener('focus', () => el.select());
            el.addEventListener('mouseup', e => e.preventDefault());
          });
    <\/script>
<\/body>
<\/html>
`);
			newWin.document.close();
			window.location.replace("https://www.google.com");
		}
	} else {
		openSearch(inputValue);
	}
};

const searchYoutube = () => {
	openSearch(document.getElementById('searchKeyword').value.trim());
};

const bindEnter = (id, handler) => {
	document.getElementById(id).addEventListener('keydown', e => {
		if (e.key === 'Enter') handler();
	});
};
bindEnter('videoId', loadPlayer);
bindEnter('searchKeyword', searchYoutube);
