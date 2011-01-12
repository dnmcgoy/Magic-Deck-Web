class ApplicationController < ActionController::Base

  #include HoptoadNotifier::Catcher

  before_filter :set_user

  #helper :all # include all helpers, all the time
  protect_from_forgery # See ActionController::RequestForgeryProtection for details

  # Scrub sensitive parameters from your log
  # filter_parameter_logging :password

  private

  def set_user
    @user = session[:user].nil? ? nil : User.find(session[:user])
  end

  def require_login
    if session[:user].nil?
      redirect_to root_url # halts request cycle
    end
  end
end
