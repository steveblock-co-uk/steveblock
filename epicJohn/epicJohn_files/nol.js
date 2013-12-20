/*Generic pop up code - please use this only unless you really need something different*/
function popUpPage(url, parameters, name)
{
	var day = new Date();
	var pageName = name ? name : day.getTime()

	eval("bbc"+pageName+" = window.open('"+url+"','"+pageName+"','"+parameters+"')");

	if (eval("bbc"+pageName) && window.focus) eval("bbc"+pageName).focus();
}


/* launch code for avconsole */
function launch_main_player(site)
{
	
	if (site == null) //no site name passed in - have to leave this check in
	{
		clickmain=window.open("http://news.bbc.co.uk/broadband/news_console.stm","clickmain","toolbar=0,location=0,status=0,menubar=0,scrollbars=0,resizable=0,top=100,left=100,width=671,height=373");
	}
	else
	{
		if (site == 'ukfs')
		{
			clickmain=window.open("http://news.bbc.co.uk/broadband/news_console.stm","clickmain","toolbar=0,location=0,status=0,menubar=0,scrollbars=0,resizable=0,top=100,left=100,width=671,height=373");

		}
		else if (site == 'ifs')
		{
			clickmain=window.open("/narrowband/static/audio_video/avconsole/ifs/f_news_console.stm","clickmain","toolbar=0,location=0,status=0,menubar=0,scrollbars=0,resizable=0,top=100,left=100,width=671,height=373");
		}
	}
}

function getPlatform()
{
	var myUserAgent;
	myUserAgent = navigator.userAgent.toLowerCase();

	if ((myUserAgent.indexOf("win") != -1) ||  (myUserAgent.indexOf("16bit") != -1))
	{
		return "win";
	}
	
	if (myUserAgent.indexOf("mac") != -1)
	{
		return "mac";
	}  
	
	if (myUserAgent.indexOf("x11") != -1)
	{
		return "unx";
	}  
	
	return "other";
}

function getBrowserType()
{
	var myUserAgent;

	var myMajor;
	myUserAgent= navigator.userAgent.toLowerCase();
	myMajor= parseInt(navigator.appVersion);
	if( (myUserAgent.indexOf('mozilla')!= -1) &&(myUserAgent.indexOf('spoofer')== -1) &&(myUserAgent.indexOf('compatible') == -1) &&(myUserAgent.indexOf('opera') == -1) &&(myUserAgent.indexOf('webtv')  == -1) )
	{  
		if (myMajor > 3)
		{
			return "nav4";
		}
	
		return "nav";
	}
	
	if (myUserAgent.indexOf("msie")!= -1)
	{  
	
		if (myMajor > 3)
		{
			return "ie4";
  		} 
	
		return "ie";
	}
// dom compliant browsers are allowed
	if(document.body.firstChild) return "domCompliant";
	return "other";
}

function request_launch(site)
{
	if (getPlatform() != "other" &&(getBrowserType() == "ie4" || getBrowserType() == "nav4" || getBrowserType() == "domCompliant"))
	{
		launch_main_player(site);
	} 
	else 
	{
		self.location.href="/1/shared/bsp/hi/services/help/html/av_console_browsers.stm";
	}
	
	return;
}


function openWindow(){
	var mywin = null;var unLoad;
	var surl = "http://news.bbc.co.uk/hi/english/static/business/data_desktop/mardata/ftse.stm";
	if (!mywin){mywin = window.open(surl,'BBCNewsOnline','toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=0,resizable=0,width=370,height=292');
		mywin.location = surl;
		if (mywin.opener == null) mywin.opener = window; 
		mywin.opener.name = "opener";
	}else{
		if (mywin.closed){	
			mywin = null;openWindow();
		}
		if (mywin.focus) mywin.focus();
		mywin.location.href = surl;
	}
}



function popup(url) {
	day = new Date();
	id = day.getTime();
	eval("page" + id + " = window.open(url, '" + id + "', 'toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=0,resizable=0,width=370,height=220');");
} 


function popUp(pageurl,width,height,scroll){
	day = new Date();
	id = day.getTime();
	if (window.screen) {  
		lpos = (screen.width/2)-(width/2);  
		hpos = (screen.height/2)-(height/2);
	}else	{
		lpos = 1;
		hpos = 1;		
	}		 		
	eval("bbcnews"+id+" = window.open('"+pageurl+"','"+id+"','toolbar=0,scrollbars="+scroll+",location=0,status=0,menubar=0,resizable=0,width="+width+",height="+height+",left="+lpos+",top="+hpos+"')");
}

