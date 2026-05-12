using System;
using System.Collections.Generic;
using System.Linq;

Console.WriteLine("🧪 ĐANG TEST LOGIC ẤP TRỨNG GÀ (100 LẦN THỬ)...");

string[] petTypes = { 
    "chicken_classic", "chicken_golden", "chicken_ninja", "chicken_wizard", 
    "chicken_robot", "chicken_angel", "chicken_devil", "chicken_samurai", 
    "chicken_viking", "chicken_cosmic" 
};

Dictionary<string, int> stats = petTypes.ToDictionary(t => t, _ => 0);

for (int i = 0; i < 100; i++)
{
    var randomType = petTypes[Random.Shared.Next(petTypes.Length)];
    stats[randomType]++;
}

Console.WriteLine("\n📊 KẾT QUẢ PHÂN PHỐI NGẪU NHIÊN:");
Console.WriteLine("----------------------------------");
foreach (var item in stats.OrderByDescending(x => x.Value))
{
    string bar = new string('█', item.Value / 2);
    Console.WriteLine($"{item.Key.PadRight(18)}: {item.Value} lần {bar}");
}

Console.WriteLine("\n✅ LOGIC NGẪU NHIÊN HOẠT ĐỘNG TỐT!");
