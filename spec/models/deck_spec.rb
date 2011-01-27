require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe Deck do

  describe "cmc_values" do
    it "should count cmc for maindeck non lands" do
      deck = Factory.create(:deck, :name => "Google Chart Test")

      deck.maindeck.runs = []
      deck.maindeck << make_run(:land, 20)
      deck.maindeck << make_run(:creature, 4, 1)
      deck.maindeck << make_run(:spell, 4, 1)
      deck.maindeck << make_run(:creature, 2, 2)
      deck.maindeck << make_run(:creature, 4, 3)
      deck.maindeck << make_run(:spell, 3, 5)
      deck.save

      deck.cmc_values.should == [8,2,4,0,3]
    end

    it "should filter bad runs" do
      deck = Factory.create(:deck, :name => "Google Chart Test")

      deck.maindeck.runs = []
      deck.maindeck << make_run(:land, 20)
      deck.maindeck << make_run(:creature, 4, 1)
      deck.maindeck << make_run(:spell, 4, 2)
      deck.maindeck << Run.new(:count => 3, :card => Factory.create(:card, :cmc => nil))
      deck.save

      deck.cmc_values.should == [4,4]
    end

  end

  def make_run(card_type_sym, count = 1, cmc = 0)
    Factory.create(:run, :count => count, :card => Factory.create(card_type_sym, :cmc => cmc))
  end
 
  describe "runs delegate to cards" do
    it "should be able to access card attrs through a run" do
      deck = Factory.create(:deck, :name => "run delegation test")

      card = Factory.create(:spell, :cmc => 2)
 
      deck.maindeck.runs = []
      deck.maindeck.runs << Run.new(:count => 3, :card_id => card.id)
      deck.save
 
      deck = Deck.find(deck.id)
      deck.maindeck.runs.first.cmc.should == 2
    end
  end

  def card_with_cc(cc)
    Run.new(:card => Factory.create(:spell, :cc => cc))
  end

  describe "colors" do
    it "should work" do
      deck = Factory.create(:deck)

      deck.maindeck.runs << card_with_cc("")
      deck.maindeck.runs << card_with_cc("1G")
      deck.maindeck.runs << card_with_cc("2(G/B)")
      deck.maindeck.runs << card_with_cc("")
      deck.maindeck.runs << card_with_cc("1GR")
      deck.maindeck.runs << card_with_cc("3RG")
      deck.save

      deck.colors.chars.to_a.sort.should == "RGB".chars.to_a.sort
    end
  end

  describe "count" do
    it "should count maindeck" do
      deck = Factory.create(:deck)
      deck.count.should == 0
    end
  end

end
