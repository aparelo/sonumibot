# Sünonüümirobot

Messenger bot that looks up synonyms in the Estonian synonym dictionary. A live version of the bot can be found on Facebook as Sünonüümirobot.
<script>
window.fbAsyncInit = function() {
  FB.init({
	appId            : 'your-app-id',
	autoLogAppEvents : true,
	xfbml            : true,
	version          : 'v3.2'
  });
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "https://connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));
</script>
<div class="fb-messengermessageus" 
  messenger_app_id="1185899384869819" 
  page_id="1473407816103463"
  color="white"
  size="xlarge">
</div>

## Usage
To use the bot you need to obtain a JSON password from EKI and set up a Facebook app for the bot. Then run the bot on a server.
