# run with:
# rails runner script/import_xml.rb ~/code/magic/MagicApp/data/setXML

ELEM = Nokogiri::XML::Reader::TYPE_ELEMENT

def parse_card_and_printing(node, set)
  attrs = Nokogiri::XML.fragment(node.outer_xml)

  name = attrs.at(:name).text
  card = Card.first(:name => name)

  if card.nil?
    card_attrs = {
      :name => name,
      :cardtype => attrs.at(:type).text,
      :cc => attrs.at(:cost).text,
      :cmc => attrs.at(:cmc).text,
      :color => attrs.at(:color).text,
      :power => attrs.at(:power).text,
      :toughness => attrs.at(:toughness).text,
      :oracle_text => attrs.at(:oracleText).text
    }
    card = Card.create(card_attrs)
  end

  printing_attrs = {
    :mtg_id => attrs.at(:id).text,
    :rarity => attrs.at(:rarity).text,
    :set_number => attrs.at(:setNumber).text,
    :artist => attrs.at(:artist).text,
    :printed_text => attrs.at(:printedText).text,
    :flavor_text => attrs.at(:flavorText).text,
    :set_id => set.id
  }
  card.printings << Printing.new(printing_attrs)
  card.save!
end

def parse_file(file)
  set = nil

  Nokogiri::XML::Reader(File.open(file).read).each do |node|
    next unless node.node_type == ELEM

    if node.depth == 1 # magic set attrs

      case node.name
      when 'name'
        name = node.inner_xml
        return unless MagicSet.first(:name => name).nil?
        puts name
        set = MagicSet.new(:name => name)
      when 'releaseDate'
        set.release_date = node.inner_xml
      when 'shortname'
        set.short_name = node.inner_xml
      end

    elsif node.depth == 2 # top level card attrs
      parse_card_and_printing(node, set)
    end
    
  end

  set.save! unless set.nil?
end



folder = ARGV[0]
puts "Importing xml from folder #{folder}"

Dir[folder + "/*xml"].each do |file|
  parse_file(file)
end
