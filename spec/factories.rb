# Cards
Factory.define :card do |c|
  c.name "Sample Card"
end

Factory.define :land, :parent => :card do |c|
  c.cmc 0  
  c.cardtype "land"
end

Factory.define :creature, :parent => :card do |c|
  c.cmc 1
  c.cardtype "creature"
end

Factory.define :spell, :parent => :card do |c|
  c.cmc 1
  c.cardtype "spell"
end


# Decks
Factory.define :run do |r|
  r.count 0
  # for some stupid reason, this is being called during
  # rails initialization, even outside of test
  # so, disable now for the sake of progress
  #r.association :card
end

Factory.define :deck do |d|
  d.name "A Deck"
end

Factory.define :full_deck, :parent => :deck do |d|
  d.name "A Deck"
  d.association :maindeck, :factory => :full_pile
end

Factory.define :pile do |p|
  p.runs []
end

Factory.define :full_pile, :parent => :pile do |p|
  p.runs [Factory(:run, :count => 60)]
end


# Users
Factory.define :user do |u|
  u.nick "asdf"
end
