// ignore_for_file: constant_identifier_names

const JSON_URL="https://www.kompassit.com/iptv/tv.json";


 const  egybestHeaders = {
     "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
    "Referer": "https://egybestvid.com/",
    "Origin": "https://egybestvid.com",
    "Accept": "*/*",
    "Connection": "keep-alive",
  };



const defautWebsiteApi="https://egymovies.org/";
const baseUrl="${defautWebsiteApi}api/v1";
const egyBestTopTen="$baseUrl/channel/64?channelType=channel&restriction&loader=channelPage";
String getMovieInfos(String id) =>"$baseUrl/titles/$id?loader=titlePage";
String getRelatedMovies(String id) =>"$baseUrl/titles/$id/related";
String getSearchQuery(String query) =>"$baseUrl/search/$query?loader=searchAutocomplete";
String getActorInfos(String id) =>"$baseUrl/people/$id?loader=personPage";

String getFilteredMovises(int page,String channel){
return "$baseUrl/channel/$channel?restriction&order=created_at:desc&page=$page&paginate=lengthAware&returnContentOnly=true";
}

const filterGenres=[{"value":1,"name":"جريمة"},{"value":2,"name":"دراما"},{"value":3,"name":"خيال علمي"},{"value":4,"name":"حركة"},{"value":5,"name":"حرب"},{"value":6,"name":"إثارة"},{"value":7,"name":"فانتازيا"},{"value":8,"name":"رعب"},{"value":9,"name":"مغامرة"},{"value":10,"name":"غموض"},{"value":11,"name":"تاريخ"},{"value":12,"name":"كوميديا"},{"value":13,"name":"رومنسية"},{"value":14,"name":"عائلي"},{"value":15,"name":"رسوم متحركة"},{"value":16,"name":"غربي"},{"value":17,"name":"موسيقى"},{"value":18,"name":"وثائقي"},{"value":19,"name":"خيال علمي وفانتازيا"},{"value":20,"name":"حركة ومغامرة"},{"value":21,"name":"حرب وسياسة"},{"value":22,"name":"فيلم تلفازي"}];
const filterLangues=[{"value":"en","name":"English","total":2095},{"value":"hi","name":"Hindi","total":101},{"value":"ko","name":"Korean","total":100},{"value":"es","name":"Spanish","total":71},{"value":"fr","name":"French","total":68},{"value":"tr","name":"Turkish","total":48},{"value":"zh","name":"Mandarin","total":27},{"value":"de","name":"German","total":23},{"value":"id","name":"Indonesian","total":21},{"value":"ja","name":"Japanese","total":17},{"value":"nl","name":"Dutch","total":16},{"value":"ru","name":"Russian","total":16},{"value":"cn","name":"Cantonese","total":15},{"value":"no","name":"Norwegian","total":14},{"value":"pl","name":"Polish","total":14},{"value":"pt","name":"Portuguese","total":12},{"value":"da","name":"Danish","total":11},{"value":"it","name":"Italian","total":10},{"value":"sv","name":"Swedish","total":6},{"value":"th","name":"Thai","total":3},{"value":"fi","name":"Finnish","total":3},{"value":"ms","name":"Malay","total":3},{"value":"te","name":"Telugu","total":3},{"value":"ta","name":"Tamil","total":3},{"value":"tl","name":"Tagalog","total":2},{"value":"ml","name":"Malayalam","total":2},{"value":"uk","name":"Ukrainian","total":2},{"value":"fa","name":"Persian","total":2},{"value":"is","name":"Icelandic","total":1},{"value":"sk","name":"Slovak","total":1},{"value":"lv","name":"Latvian","total":1},{"value":"bn","name":"Bengali","total":1},{"value":"hu","name":"Hungarian","total":1},{"value":"km","name":"Khmer","total":1},{"value":"ro","name":"Romanian","total":1},{"value":"ka","name":"Georgian","total":1},{"value":"vi","name":"Vietnamese","total":1}];
const filterCountries=[{"value":1,"name":"Japan"},{"value":2,"name":"South Korea"},{"value":3,"name":"China"},{"value":4,"name":"Hong Kong"},{"value":5,"name":"Vietnam"},{"value":6,"name":"United Kingdom"},{"value":7,"name":"United States of America"},{"value":8,"name":"Indonesia"},{"value":9,"name":"India"},{"value":10,"name":"Taiwan"},{"value":11,"name":"Iceland"},{"value":12,"name":"United Arab Emirates"},{"value":13,"name":"Russia"},{"value":14,"name":"New Zealand"},{"value":15,"name":"Italy"},{"value":16,"name":"Spain"},{"value":17,"name":"Germany"},{"value":18,"name":"Belgium"},{"value":19,"name":"Poland"},{"value":20,"name":"Malta"},{"value":21,"name":"Netherlands"},{"value":22,"name":"Denmark"},{"value":23,"name":"Canada"},{"value":24,"name":"France"},{"value":25,"name":"Ukraine"},{"value":26,"name":"Iraq"},{"value":27,"name":"Australia"},{"value":28,"name":"Luxembourg"},{"value":29,"name":"Ireland"},{"value":30,"name":"Latvia"},{"value":31,"name":"Finland"},{"value":32,"name":"Turkey"},{"value":33,"name":"Thailand"},{"value":34,"name":"Czech Republic"},{"value":35,"name":"Austria"},{"value":36,"name":"Argentina"},{"value":37,"name":"Estonia"},{"value":38,"name":"Serbia"},{"value":39,"name":"Philippines"},{"value":40,"name":"Chile"},{"value":41,"name":"Switzerland"},{"value":42,"name":"Malaysia"},{"value":43,"name":"Singapore"},{"value":44,"name":"South Africa"},{"value":45,"name":"Sweden"},{"value":46,"name":"Slovakia"},{"value":47,"name":"Brazil"},{"value":48,"name":"Mexico"},{"value":49,"name":"Cyprus"},{"value":50,"name":"Albania"},{"value":51,"name":"Jordan"},{"value":52,"name":"Bulgaria"},{"value":53,"name":"Bosnia and Herzegovina"},{"value":54,"name":"Hungary"},{"value":55,"name":"Norway"},{"value":56,"name":"Dominican Republic"},{"value":57,"name":"Liechtenstein"},{"value":58,"name":"Romania"},{"value":59,"name":"Guadaloupe"},{"value":60,"name":"Kazakhstan"},{"value":61,"name":"Greece"},{"value":62,"name":"Nigeria"},{"value":63,"name":"St. Kitts and Nevis"},{"value":64,"name":"Colombia"},{"value":65,"name":"Georgia"},{"value":66,"name":"Bangladesh"},{"value":67,"name":"Portugal"},{"value":68,"name":"Puerto Rico"},{"value":69,"name":"Morocco"},{"value":70,"name":"Iran"},{"value":71,"name":"Slovenia"}];
