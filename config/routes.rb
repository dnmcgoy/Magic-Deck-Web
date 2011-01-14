Tdb::Application.routes.draw do

  resources :cards

  resources :decks do
    resources :runs
    member do
      get :sample
      get :count
      post :rename
    end
    match "mana_curve_chart" => "decks#mana_curve_chart"
  end

  #with_options(:controller => 'decks') do |decks|
  #  decks.connect 'decks/:id/mana_curve_chart', :action => 'mana_curve_chart'
  #end

  #map.login "login", :controller => :rpx, :action => :index
  #map.logout "logout", :controller => :rpx, :action => :logout

  match "login" => "rpx#index", :as => :login
  match "logout" => "rpx#logout", :as => :logout

  match "tools" => "landing#tools"
  match "about" => "landing#about"

  #map.connect "tools", :controller => :landing, :action => :tools
  #map.connect "about", :controller => :landing, :action => :about

  root :to => 'landing#index'

end
