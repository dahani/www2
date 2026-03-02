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
String getMovieInfos(int id) =>"$baseUrl/titles/$id?loader=titlePage";
String getSearchQuery(String query) =>"$baseUrl/search/$query?loader=searchAutocomplete";
String getActorInfos(String id) =>"$baseUrl/people/$id?loader=personPage";

String getFilteredMovises(int page,String channel){
return "$baseUrl/channel/$channel?restriction&order=created_at:desc&page=$page&paginate=lengthAware&returnContentOnly=true";
}

