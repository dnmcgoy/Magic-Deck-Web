folder = ARGV[0]

puts "Importing xml from folder #{folder}"

Dir[folder + "/*xml"].each do |file|
  puts file

  reader = Nokogiri::XML::Reader(File.open(file).read)

  reader.each do |node|
    # node is an instance of Nokogiri::XML::Reader
    if node.depth == 1 && node.node_type == 1
      next if node.name == "list"
      puts node.name
      puts node.inner_xml
      puts '-' * 25
    end
  end
  break
end
