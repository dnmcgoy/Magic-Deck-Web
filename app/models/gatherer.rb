require 'net/http'
require 'uri'
require 'hpricot'

class Gatherer

  def self.baseurl
    "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid="
  end

  def self.retrieve_gatherer_info(name)
    urlString = "http://gatherer.wizards.com/Pages/Card/Details.aspx?name=#{name}"

    info = {}
    begin
      url = URI.parse(urlString)
      result = Net::HTTP.start(url.host, url.port) { |http|
        http.get("#{url.path}?#{url.query}")
      }
      parse(result.body)
    rescue => error
      Rails.logger.info("Error hitting gatherer\n#{error.inspect}")
    end
  end

  def self.parse(docText)
    doc = Hpricot(docText)

    results = {}
    results[:mtg_id] = docText.scan(/multiverseid=(\d+)/).flatten.first
    
    return {} if results[:mtg_id].nil?
    
    results[:cmc] = parse_cmc(doc)
    results[:cc] = parse_cc(doc)
    results[:cardtype] = parse_cardtype(doc)
    results
  end

  def self.parse_cardtype(doc)
    type_line = doc.search("#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_typeRow div.value").inner_html.strip
    if !(type_line.scan(/Enchant/).empty?)
      "spell"
    elsif !(type_line.scan(/Land/).empty?)
      "land"
    elsif !(type_line.scan(/Creature/).empty?)
      "creature"
    else
      "spell"
    end
  end

  def self.parse_cmc(doc)
    doc.search("#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cmcRow div.value").text.strip.to_i
  end

  def self.parse_cc(doc)
    doc.search("#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_manaRow div.value img").map { |img|
      alt = img['alt'].strip
      if alt.scan(/\d+/).first
        alt
      else
        convert_mana_symbol(alt)
      end
    }.join('')
  end
  def self.convert_mana_symbol(name)
    if !(name.scan(/\sor\s/).empty?)
      name.scan(/(.*)\sor\s(.*)/) { |a,b|
        first = convert_mana_symbol(a)
        second = convert_mana_symbol(b)
        return "(#{first}/#{second})"
      }
    else
      case name
        when "Green"
          "G"
        when "Red"
          "R"
        when "Black"
          "B"
        when "Blue"
          "U"
        when "White"
          "W"
      end
    end
  end

end
