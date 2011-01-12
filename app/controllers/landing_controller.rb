class LandingController < ApplicationController

  def index
  end

  def tools
    render "tools"
  end

  def about
    render "about"
  end
end
