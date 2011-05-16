class IdentifiersController < ApplicationController
  def index
    @identifiers = @user.identifiers if @user
  end
  
  def create
    omniauth = request.env["omniauth.auth"]
    current_user = User.first({'identifiers.provider' => omniauth['provider'], 'identifiers.ident' => omniauth['uid'].to_s})
    if !current_user
      current_user = User.new
      current_user.apply_omniauth(omniauth)
      if current_user.save
        flash[:notice] = "Signed in successfully."
      else
        session[:omniauth] = omniauth.except('extra')
      end
   end

    session[:user] = current_user.id
    session[:ident] = omniauth['uid']

    flash[:notice] = "Signed in successfully."
    redirect_to "/"
  end
  
  def destroy
    session[:user] = nil
    session[:ident] = nil
    flash[:notice] = "Successfully destroyed identifier."
    redirect_to '/'
  end
end
