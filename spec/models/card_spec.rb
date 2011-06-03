require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe Card do

  describe "autocomplete" do
    before do
      Card.destroy_all
      @c1 = Card.create!({:name => "Daughter of Autumn"})
      @c2 = Card.create!({:name => "Daunting Defender"})
      @c3 = Card.create!({:name => "Dauntless Dourbark"})
      @c4 = Card.create!({:name => "Counterspell"})
      @c5 = Card.create!({:name => "Flash"})
    end

    it "should return cards whose name starts with the supplied term" do
      cards = Card.autocomplete("dau")
      cards.map(&:name).sort.should == [@c1, @c2, @c3].map(&:name).sort
    end

    it "should ignore leading digits" do
      cards = Card.autocomplete("4 dau")
      cards.map(&:name).sort.should == [@c1, @c2, @c3].map(&:name).sort
    end

    it "should ignore leading x[digit]" do
      cards = Card.autocomplete("x4 dau")
      cards.map(&:name).sort.should == [@c1, @c2, @c3].map(&:name).sort
    end

    it "should ignore leading [digit]x" do
      cards = Card.autocomplete("3x dau")
      cards.map(&:name).sort.should == [@c1, @c2, @c3].map(&:name).sort
    end

    it "should ignore ledding -digits" do
      cards = Card.autocomplete("-2 dau")
      cards.map(&:name).sort.should == [@c1, @c2, @c3].map(&:name).sort
    end

  end

  describe "after_create" do
    it "should fail gracefully when sync fails" do
      Gatherer.should_receive("retrieve_gatherer_info").with("forest").and_return({})
      c = Card.create({:name => "forest"})
      c.mtg_id.should be_nil
      c.name.should == "forest"
      c.synced.should == false
    end

    it "should save data when sync succeeds" do
      forestData = {:name => "Forest", :cardtype => "land", :printings => ["123"]}
      Gatherer.should_receive("retrieve_gatherer_info").with("forest").and_return(forestData)
      c = Card.create!({:name => "forest"})
      c.name.should == "forest"
      c.mtg_id.should == "123"
      c.cardtype.should == "land"
      c.synced.should == true
    end

    it "should escape spaces before sending to gatherer" do
      Gatherer.should_receive("retrieve_gatherer_info").with("llanowar%20elves").and_return({})
      card = Card.create!({:name => "llanowar elves"})
    end
  end
end
