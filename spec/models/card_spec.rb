require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe Card do

  describe "after_create" do
    it "should fail gracefully when sync fails" do
      Gatherer.should_receive("retrieve_gatherer_info").with("forest").and_return({})
      c = Card.create({:name => "forest"})
      c.name.should == "forest"
      c.mtg_id.should be_nil
      c.synced.should == false
    end

    it "should save data when sync succeeds" do
      forestData = {:mtg_id => "123", :cardtype => "land"}
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
