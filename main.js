window.onload = function()
{
	var dictionary = {};

	var commands = {
		'append':function(name,definition,source)
		{
			dictionary[name].def += definition;
			if(typeof source !== 'undefined')
			{
				dictionary[name].src += source;
			}	
		},

		'clear':function()
		{
			[...document.getElementsByClassName('search-result')].forEach(function(el)
					{
						document.body.removeChild(el);
					});
		},

		'define':function(name,definition,source)
		{
			dictionary[name] = {};
			dictionary[name].def = definition;
			if(typeof source !== 'undefined')
			{
				dictionary[name].src = source;
			}
		},

		'erase':function(arg)
		{
			[...document.getElementsByClassName('search-result')].forEach(function(el)
					{
						if(el.children[0].innerHTML.trim() === arg.trim())
						{
							document.body.removeChild(el);
						}
					});
		},

		'load':function()
		{
			document.getElementById('filereader').click();
		},

		'save':function(filename)
		{
			var el = document.createElement('a');
			el.setAttribute('href','data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(dictionary)));
			el.setAttribute('download',filename || 'whiteboard-dictionary-1.txt');
			el.style.display = 'none';
			document.body.appendChild(el);
			el.click();
			document.body.removeChild(el);
		},

		'whatis':function(name)
		{
			if(typeof dictionary[name] !== 'undefined')
			{
				var source = (typeof dictionary[name].src === 'undefined') ? '' : dictionary[name].src;
				generate_search_result(name + ' ' + source,dictionary[name].def);
			}
		}
	}

	document.getElementById('filereader').onchange = function()
	{
		var reader = new FileReader();
		reader.onload = function(ev)
		{
			dictionary = JSON.parse(ev.target.result);
		}
		reader.readAsText(document.getElementById('filereader').files[0]);
	}

	function generate_search_result(title,body)
	{
		var template = document.getElementById('t-search-result');
		var node = document.importNode(template.content,true);
		node.children[0].children[0].innerHTML = title;
		node.children[0].children[1].innerHTML = body;
		document.body.appendChild(node.children[0]);
	}

	function tokenize(str)
	{
		var tokens = [];
		var SPECIALS = [
			'[',']',','
		];

		for(var i=0;i<str.length;i++)
		{
			if('0123456789'.includes(str[i]))
			{
				var num = str[i++];
				while(i < str.length && '0123456789'.includes(str[i]))
				{
					num += str[i++];
				}
				i--;
				tokens.push(num);
			}
			else if(str[i].toUpperCase() !== str[i].toLowerCase() || str[i] === '_')
			{
				var st = str[i++];
				while(i < str.length && (str[i].toUpperCase() !== str[i].toLowerCase() || str[i] === '_'))
				{
					st += str[i++];
				}
				i--;
				tokens.push(st);
			}
			else if(str[i] === '\'')
			{
				var lit = '';
				i++;
				while(i < str.length && str[i] !== '\'')
				{
					if(str[i] == '\\')
					{
						lit += str[i++];
					}
					lit += str[i++];
				}
				tokens.push(lit);
			}
			else if(SPECIALS.includes(str[i]))
			{
				tokens.push(str[i]);
			}
		}

		return tokens;
	}

	document.getElementById('navbar').onkeydown = function(ev)
	{
		if(ev.keyCode === 13)
		{
			ev.preventDefault();
			var content = document.getElementById('navbar').value;
			var tokens = tokenize(content);
			if(tokens.length > 0)
			{
				var cmd = tokens[0];
				if(tokens.length > 1)
				{
					var args = tokens.slice(1);
					if(typeof commands[cmd] !== 'undefined')
					{
						commands[cmd].apply(null,args);
					}
				}
				else{commands[cmd]();}
			}
		}
	}
}
