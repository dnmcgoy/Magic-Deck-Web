class IdentifiersController < ApplicationController
  def index
    @identifiers = @user.identifiers if @user
  end
  
  def create
    omniauth = request.env["omniauth.auth"]
    user_with_identity = User.first({'identifiers.provider' => omniauth['provider'], 'identifiers.ident' => omniauth['uid'].to_s})
    if @user
      if user_with_identity
        flash[:notice] = "Signed in successfully."
      else
        @user.identifiers << Identifier.new(:provider => omniauth['provider'], :ident => omniauth['uid'].to_s)
        flash[:notice] = "Authentication successful."
      end
    else
      if !user_with_identity
        user_with_identity = User.new
        user_with_identity.apply_omniauth(omniauth)
      end
      @user = user_with_identity
    end

    #This is a hack that needs to be ironed out since we want to see friends for all services.
    @user['facebook_token'] = omniauth['credentials']['token']

    if @user.save!
      flash[:notice] = "Signed in successfully."
    else
      session[:omniauth] = omniauth.except('extra')
    end

    session[:user] = @user.id
    session[:ident] = omniauth['uid']

    flash[:notice] = "Signed in successfully."
    redirect_to "/decks"
  end
  
  def destroy
    session[:user] = nil
    session[:ident] = nil
    flash[:notice] = "Successfully destroyed identifier."
    redirect_to '/'
  end
end
