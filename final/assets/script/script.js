let mybutton = document.getElementById("top_btn");

$(window).onscroll = function() {scrollFunction()};

function scrollFunction() {
  if ($(window).scrollTop() > 5 || document.documentElement.scrollTop > 5) {
    mybutton.addClass('show')
  } else {
    mybutton.removeClass('show');
  }
};

function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
mybutton.onclick = topFunction;