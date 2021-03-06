window.blogSearchData;
window.bidx;

document.addEventListener('DOMContentLoaded', function (event) {
  var indexReq = new XMLHttpRequest();
  indexReq.open('GET', "/js/blog-search-index.json"); // pre-build from scripts
  indexReq.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      var parsedData = JSON.parse(this.response);
      window.bidx = lunr.Index.load(parsedData.idx);
      window.blogSearchData = parsedData.store;
      console.log("Blog search index loaded, good to go!");
      readyBlogSearch();
    }
  };
  indexReq.onerror = function() {
    console.log("Error loading index");
  }
  indexReq.send();


  function readyBlogSearch() {
    var searchOverlay = document.getElementById('js-blog-search-overlay');
    var searchInput = document.getElementById('js-blog-search-input');
    var closeSearch = document.getElementById('js-blog-search-clear');
    var searchResults = document.getElementById('js-blog-search-results');
    var searchTerm = document.getElementById('js-search-term');
    var blogIndex = document.getElementById('js-blog-index');

    if (searchOverlay && searchInput) {
      searchInput.value = '';

      closeSearch.onclick = function () {
        if (searchOverlay.classList.contains('open')) {
          searchOverlay.classList.remove('open');
          blogIndex.classList.remove('hidden');
          searchTerm.innerHtml = '';
        }
      }

      function lunrSearch (event) {
        var query = searchInput.value;
        if (query.length === 0) {
          searchResults.innerHTML = '';
          searchTerm.innerHTML = '';
          searchOverlay.classList.remove('open');
          blogIndex.classList.remove('hidden');
        }
        if ((event.keyCode !== 9) && (query.length > 2)) {
          searchTerm.innerHTML = query;
          searchOverlay.classList.add('open');
          blogIndex.classList.add('hidden');
          var matches = window.bidx.search(query);
          displayResults(matches);
        }
      }
      searchInput.addEventListener('keyup', lunrSearch, true);

      function emptyResults (term) {
        var out;
        out = '<li><h2 class="h4">Keine Ergebnisse für "'+ term +'"</h2>';
        out += '<p class="h4">Versuche einen anderen Suchbegriff</p></li>';
        return out;
      }

      function displayResults (results) {
        var inputVal = searchInput.value;
        if (results.length) {
          searchResults.innerHTML = '';
          var out = '';
          results.forEach(function(result) {
            var item = window.blogSearchData[result.ref];
            var date = new Date(item.date.replace(' +0000 UTC', 'Z'))
                .toLocaleDateString('de-DE');
            out += '<li class="c__post--item">';
            out += '<a href="'+ item.url +'" class="row no-gutters">';
            out += '<h2 class="c__post__title h4 col col-12 col-sm-10">'+ item.title +'</h2>';
            out += '<p class="c__post__date h4 col-12 col-sm-2">'+ date +'</p>';
            out += '</a></li>';
          });
          searchResults.innerHTML = out;
        } else {
          searchResults.innerHTML = emptyResults(inputVal);
        }
      }
    }
  }
});
