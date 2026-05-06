// ignore_for_file: constant_identifier_names

const JSON_URL="http://wallpapers-app.atspace.cc/tv.json";

bool isTv=false;
 const  egybestHeaders = {
     "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
    "Referer": "https://egybestvid.com/",
    "Origin": "https://egybestvid.com",
    "Accept": "*/*",
    "Connection": "keep-alive",
  };
class ServerConfig {
  static const List<String> servers = [
    "https://egymovies.org/",
    "https://egydead.ca/",
    "https://egybest.la/"
  ];

  static const String prefKey = "selected_server";
}


void setApiUrl(String url){
   defautWebsiteApi=url;
 baseUrl="${defautWebsiteApi}api/v1";
}
String defautWebsiteApi="https://egymovies.org/";
String baseUrl="${defautWebsiteApi}api/v1";

String egyBestTopTen(){int idREcent=12;
  if(baseUrl.contains("dead")){
    idREcent=11;
  }else  if(baseUrl.contains("egybest")){
    idREcent=12;
  }else  if(baseUrl.contains("egymovies")){
    idREcent=12;
  }


  return "$baseUrl/channel/$idREcent?channelType=channel&restriction&loader=channelPage";
}

String getNetflixChannelID(){
  return baseUrl.contains("dead")?"6":"19";

/*https://egydead.ca/api/v1/channel/6?restriction=&order=created_at:desc&page=2&paginate=lengthAware&returnContentOnly=true
https://egybest.la/api/v1/channel/19?restriction=&order=created_at:desc&page=2&paginate=lengthAware&returnContentOnly=true
https://egymovies.org/api/v1/channel/19?restriction&order=created_at:desc&page=1&paginate=lengthAware&returnContentOnly=true*/
}
String getMovieInfos(String id) =>"$baseUrl/titles/$id?loader=titlePage";
String getRelatedMovies(String id) =>"$baseUrl/titles/$id/related";
String getSearchQuery(String query) =>"$baseUrl/search/$query?loader=searchAutocomplete";
String getActorInfos(String id) =>"$baseUrl/people/$id?loader=personPage";
String getFilters() =>"$baseUrl/value-lists/titleFilterLanguages,productionCountries,genres";

String getFilteredMovises(int page,String channel){
return "$baseUrl/channel/$channel?restriction&order=created_at:desc&page=$page&paginate=lengthAware&returnContentOnly=true";
}
const filterSort=[
  {"value":"revenue","name":"أكبر الإيرادات أولا"},
   {"value":"budget","name":"أكبر ميزانية أولا"},
    {"value":"rating","name":"الأعلى تقييماً أولاً"},
     {"value":"created_at","name":"تم إنشاؤها مؤخرًا"},
     {"value":"popularity","name":"الأكثر شعبية أولاً"},

  ];



