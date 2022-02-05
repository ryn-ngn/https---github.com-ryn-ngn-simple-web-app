let restaurantData = [];
let currentRestaurant = {};
let page = 1;
let perPage = 10;
let map = {};

function avg(grades) {
  let sum = 0;
  grades.forEach((grade) => (sum += grade.score));
  return (sum / grades.length).toFixed(2);
}

let tableRows = _.template(
  `<% _.forEach(restaurants, function(restaurant) { %>
        <tr data-id="<%- restaurant._id %>">
            <td class="name-col"><%- restaurant.name %></td>
            <td class="cuisine-col"><%- restaurant.cuisine %></td>
            <td class="address-col"><%- restaurant.address.building + ' ' + restaurant.address.street %></td>
            <td class="score-col"><%= avg(restaurant.grades) %></td>
        </tr>
    <% }); %>`
);

function getRestaurantById(id) {
  return _.cloneDeep(restaurantData.find((restaurant) => restaurant._id == id));
}

function loadRestaurantData() {
  fetch(
    `https://web422-a1-ryan-nguyen.herokuapp.com/api/restaurants/?page=${page}&perPage=${perPage}`
  )
    .then((response) => response.json())
    .then((data) => {
      restaurantData = data;
      let tableRowsResult = tableRows({ restaurants: restaurantData });
      $("#restaurant-table tbody").html(tableRowsResult);
      $("#current-page").html(page);
    })
    .catch((err) => console.log(err));
}

$(function () {
  loadRestaurantData();
  $("#restaurant-table tbody").on("click", "tr", function () {
    currentRestaurant = getRestaurantById($(this).attr("data-id"));
    $(".modal-title").html(currentRestaurant.name);
    $("#restaurant-address").html(
      `${currentRestaurant.address.building} ${currentRestaurant.address.street}`
    );
    $("#restaurant-modal").modal();
  });

  $(".pagination").on("click", "#previous-page", () => {
    if (page > 1) {
      page -= 1;
      loadRestaurantData();
    }
  });

  $(".pagination").on("click", "#next-page", () => {
    page += 1;
    loadRestaurantData();
  });

  $("#restaurant-modal").on("shown.bs.modal", () => {
    let coord = currentRestaurant.address.coord;
    map = new L.Map("leaflet", {
      center: [coord[1], coord[0]],
      zoom: 18,
      layers: [
        new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
      ],
    });

    L.marker([coord[1], coord[0]]).addTo(map);
  });

  $("#restaurant-modal").on("hidden.bs.modal", () => {
    map.remove();
  });
});
