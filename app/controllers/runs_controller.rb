class RunsController < ApplicationController
  layout nil

  def index
    @runs = Deck.find(params[:deck_id]).runs

    respond_to do |format|
      format.xml  { render :xml => @runs }
    end
  end

  def create
    card_name = params[:card_name].downcase
    deck = Deck.find(params[:deck_id])
    count = params[:count].blank? ? 1 : params[:count].to_i

    card = Card.first(:name => /^#{card_name}$/i)
    puts "CARD: #{card.inspect}"
    @run = deck.maindeck.runs.detect { |r| r.card_id == card.id }
    if @run.nil?
      @run = Run.new(:card => card, :count => 0)
      deck.maindeck.runs << @run
    end

    if(!@run.nil? && @run.count + count == 0)
      deck.maindeck.runs.delete(@run)
    elsif(@run.count + count > 0)
      @run.count += count
    end

    deck.save

    respond_to do |format|
      format.json  {
        extra_attrs = [:category, :name, :cc, :cmc, :mtg_id]
        render :json => @run.to_json(:methods => extra_attrs)
      }
    end
  end

  def show
    deck = Deck.find(params[:deck_id])
    @run = deck.maindeck.runs.detect { |r| r.id == params[:id] }
    respond_to do |format|
      format.xml  { render :xml => @run.to_xml( :include => :card ) }
      format.json  { render :json => @run.to_json( :include => :card ) }
    end
  end

  def destroy
    deck = Deck.find(params[:deck_id])
    @run = deck.maindeck.runs.detect { |r| r.id.to_s == params[:id] }
    puts "about to delete run #{@run.id}"
    deck.maindeck.runs.delete(@run)
    deck.save
    head :ok
  end
end
