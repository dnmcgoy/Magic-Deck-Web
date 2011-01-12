class RpxController < ApplicationController

  skip_before_filter :verify_authenticity_token, :only => [:index] # RPX does not pass Rails form tokens...

  def index
    u = URI.parse('https://rpxnow.com/api/v2/auth_info')
    req = Net::HTTP::Post.new(u.path)
    req.set_form_data({'token' => params[:token],
                       'apiKey' => '4ec43e7f1fcbbbcd998b73210c3fbff40fd6c421',
                       'format' => 'json'})

    http = Net::HTTP.new(u.host, u.port)
    http.use_ssl = true if u.scheme == 'https'
    res = http.request(req)

    json_resp = res.body
    json = JSON.parse(json_resp)

    if json['stat'] == 'ok'

      logger.info("RPX says we have a valid user")

      unique_identifier = json['profile']['identifier']
      nickname = json['profile']['preferredUsername']
      nickname = json['profile']['displayName'] if nickname.nil?
      email = json['profile']['email']
      provider_name = json['profile']['providerName']
      photo_url = json['profile']['photo']

      logger.info("Parsed some data out: ident #{unique_identifier}, nick #{nickname}, provider #{provider_name}")

      user = User.first({'identifiers.ident' => unique_identifier.to_s})
      if user.nil?
        logger.info("User was not found, creating a new one")
        user = User.new(:email => email, :nick => nickname)
        user.identifiers << Identifier.new(:ident => unique_identifier, :provider => provider_name)
        user.save!
        logger.info("Saved new user with id #{user.id}")
      else
        logger.info("User was not nil? #{user.inspect}")
      end

      session[:user] = user.id
      session[:ident] = unique_identifier

    else
      flash[:notice] = 'Log in failed'
    end
    
    redirect_to '/'
  end

  def logout
    session[:user] = nil
    session[:ident] = nil
    redirect_to '/'    
  end
end
