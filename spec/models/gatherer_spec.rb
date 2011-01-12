require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe Gatherer do

  describe "parse" do
    it "should parse gatherer (mtg) ids" do
      card_doc = File.read("spec/fixtures/gatherer/lotus_cobra_source.html")
      parsed = Gatherer.parse(card_doc)
      parsed[:mtg_id].should == "185749"
    end

    it "should parse converted mana cost" do
      card_doc = File.read("spec/fixtures/gatherer/lotus_cobra_source.html")
      parsed = Gatherer.parse(card_doc)
      parsed[:cmc].should == 2
    end

    it "should parse mana cost for lotus cobra" do
      card_doc = File.read("spec/fixtures/gatherer/lotus_cobra_source.html")
      parsed = Gatherer.parse(card_doc)
      parsed[:cc].should == "1G"
    end

    it "should parse mana cost for messenger falcon" do
      card_doc = File.read("spec/fixtures/gatherer/messenger_falcons_source.html")
      parsed = Gatherer.parse(card_doc)
      parsed[:cc].should == "2(G/U)W"
    end

    it "should parse cardtype creature for lotus cobra" do
      card_doc = File.read("spec/fixtures/gatherer/lotus_cobra_source.html")
      parsed = Gatherer.parse(card_doc)
      parsed[:cardtype].should == "creature"
    end

    it "should parse cardtype spell for maelstrom nexus" do
      card_doc = File.read("spec/fixtures/gatherer/maelstrom_nexus_source.html")
      parsed = Gatherer.parse(card_doc)
      parsed[:cardtype].should == "spell"
    end

    
  end

  describe "convert_mana_symbol" do
    it "should convert basic symbols" do
      Gatherer.convert_mana_symbol("Green").should == "G"
      Gatherer.convert_mana_symbol("Red").should == "R"
      Gatherer.convert_mana_symbol("Black").should == "B"
      Gatherer.convert_mana_symbol("Blue").should == "U"
      Gatherer.convert_mana_symbol("White").should == "W"
    end

    it "should convert this or that symbols" do
      Gatherer.convert_mana_symbol("Green or Blue").should == "(G/U)"
      Gatherer.convert_mana_symbol("Red or White").should == "(R/W)"
      Gatherer.convert_mana_symbol("Black or Green").should == "(B/G)"
      Gatherer.convert_mana_symbol("Blue or Red").should == "(U/R)"
      Gatherer.convert_mana_symbol("White or Black").should == "(W/B)"
    end
  end
end
